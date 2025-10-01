const { nanoid } = require('nanoid');
const Url = require('../models/Url');

// In-memory cache for faster lookups (optional but recommended)
const urlCache = new Map();

// @desc    Create a short URL
// @route   POST /api/shorten
// @access  Private
const shortenUrl = async (req, res) => {
  try {
    const { originalUrl, customAlias } = req.body;

    // Validation
    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    // Validate URL format
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(originalUrl)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Ensure URL has protocol
    const formattedUrl = originalUrl.startsWith('http') 
      ? originalUrl 
      : `https://${originalUrl}`;

    // Generate short ID
    let shortId;
    if (customAlias) {
      // Check if custom alias is available
      const existing = await Url.findOne({ shortId: customAlias });
      if (existing) {
        return res.status(400).json({ error: 'Custom alias already taken' });
      }
      shortId = customAlias;
    } else {
      shortId = nanoid(7); // Generates 7-character ID
      
      // Ensure uniqueness
      let attempts = 0;
      while (await Url.findOne({ shortId }) && attempts < 5) {
        shortId = nanoid(7);
        attempts++;
      }
    }

    // Create URL document
    const url = await Url.create({
      shortId,
      originalUrl: formattedUrl,
      userId: req.user._id
    });

    // Add to cache
    urlCache.set(shortId, formattedUrl);

    const shortUrl = `${req.protocol}://${req.get('host')}/${shortId}`;

    res.status(201).json({
      success: true,
      message: 'Short URL created successfully',
      data: {
        shortId: url.shortId,
        shortUrl,
        originalUrl: url.originalUrl,
        createdAt: url.createdAt
      }
    });
  } catch (error) {
    console.error('Shorten URL error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: messages[0] });
    }
    
    res.status(500).json({ error: 'Server error while creating short URL' });
  }
};

// @desc    Redirect to original URL and log analytics
// @route   GET /:shortId
// @access  Public
const redirectUrl = async (req, res) => {
  try {
    const { shortId } = req.params;

    // Check cache first
    let originalUrl = urlCache.get(shortId);
    let url;

    if (!originalUrl) {
      // Cache miss - query database
      url = await Url.findOne({ shortId });
      
      if (!url) {
        return res.status(404).json({ error: 'Short URL not found' });
      }

      originalUrl = url.originalUrl;
      urlCache.set(shortId, originalUrl);
    } else {
      // Still need to fetch for analytics
      url = await Url.findOne({ shortId });
    }

    // Log click analytics
    const clickData = {
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
      referrer: req.get('referer') || req.get('referrer') || 'direct',
      timestamp: new Date()
    };

    // Update clicks array (async, don't wait)
    Url.findOneAndUpdate(
      { shortId },
      { $push: { clicks: clickData } },
      { new: true }
    ).catch(err => console.error('Error logging click:', err));

    // Redirect
    res.redirect(301, originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).json({ error: 'Server error during redirect' });
  }
};

// @desc    Get all links for logged-in user
// @route   GET /api/links
// @access  Private
const getUserLinks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const urls = await Url.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-clicks'); // Exclude clicks for performance

    const total = await Url.countDocuments({ userId: req.user._id });

    const urlsWithData = urls.map(url => ({
      shortId: url.shortId,
      originalUrl: url.originalUrl,
      shortUrl: `${req.protocol}://${req.get('host')}/${url.shortId}`,
      totalClicks: url.clicks ? url.clicks.length : 0,
      createdAt: url.createdAt
    }));

    res.status(200).json({
      success: true,
      data: urlsWithData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalLinks: total,
        hasMore: skip + urls.length < total
      }
    });
  } catch (error) {
    console.error('Get user links error:', error);
    res.status(500).json({ error: 'Server error while fetching links' });
  }
};

// @desc    Get analytics for a specific link
// @route   GET /api/analytics/:shortId
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const { shortId } = req.params;

    const url = await Url.findOne({ 
      shortId, 
      userId: req.user._id 
    });

    if (!url) {
      return res.status(404).json({ error: 'Link not found or unauthorized' });
    }

    // Calculate analytics
    const totalClicks = url.clicks.length;
    
    // Group clicks by date
    const clicksByDate = {};
    url.clicks.forEach(click => {
      const date = click.timestamp.toISOString().split('T')[0];
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;
    });

    // Group by browser/device (basic parsing of user agent)
    const devices = {};
    url.clicks.forEach(click => {
      const ua = click.userAgent.toLowerCase();
      let device = 'Other';
      
      if (ua.includes('mobile')) device = 'Mobile';
      else if (ua.includes('tablet')) device = 'Tablet';
      else if (ua.includes('windows') || ua.includes('mac') || ua.includes('linux')) device = 'Desktop';
      
      devices[device] = (devices[device] || 0) + 1;
    });

    // Recent clicks
    const recentClicks = url.clicks
      .slice(-10)
      .reverse()
      .map(click => ({
        ip: click.ip,
        userAgent: click.userAgent,
        referrer: click.referrer,
        timestamp: click.timestamp
      }));

    res.status(200).json({
      success: true,
      data: {
        shortId: url.shortId,
        originalUrl: url.originalUrl,
        shortUrl: `${req.protocol}://${req.get('host')}/${url.shortId}`,
        createdAt: url.createdAt,
        analytics: {
          totalClicks,
          clicksByDate,
          deviceBreakdown: devices,
          recentClicks
        }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Server error while fetching analytics' });
  }
};

// @desc    Delete a short link
// @route   DELETE /api/links/:shortId
// @access  Private
const deleteLink = async (req, res) => {
  try {
    const { shortId } = req.params;

    const url = await Url.findOneAndDelete({ 
      shortId, 
      userId: req.user._id 
    });

    if (!url) {
      return res.status(404).json({ error: 'Link not found or unauthorized' });
    }

    // Remove from cache
    urlCache.delete(shortId);

    res.status(200).json({
      success: true,
      message: 'Link deleted successfully'
    });
  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({ error: 'Server error while deleting link' });
  }
};

module.exports = {
  shortenUrl,
  redirectUrl,
  getUserLinks,
  getAnalytics,
  deleteLink
};