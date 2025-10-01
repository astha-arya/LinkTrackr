const express = require('express');
const router = express.Router();
const {
  shortenUrl,
  redirectUrl,
  getUserLinks,
  getAnalytics,
  deleteLink
} = require('../controllers/urlController');
const authMiddleware = require('../middleware/auth');

// @route   POST /api/shorten
// @desc    Create a short URL
// @access  Private
router.post('/shorten', authMiddleware, shortenUrl);

// @route   GET /api/links
// @desc    Get all links for logged-in user
// @access  Private
router.get('/links', authMiddleware, getUserLinks);

// @route   GET /api/analytics/:shortId
// @desc    Get analytics for a specific link
// @access  Private
router.get('/analytics/:shortId', authMiddleware, getAnalytics);

// @route   DELETE /api/links/:shortId
// @desc    Delete a short link
// @access  Private
router.delete('/links/:shortId', authMiddleware, deleteLink);

// @route   GET /:shortId
// @desc    Redirect to original URL and log click
// @access  Public
router.get('/:shortId', redirectUrl);

module.exports = router;