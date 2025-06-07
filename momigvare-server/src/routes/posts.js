import express from 'express';
import { Post } from '../models/Posts.js';
import { auth } from './auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Post management (problems/offers)
 */

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: List all posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [problem, offer]
 *         description: Filter by post type
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated tags
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *     responses:
 *       200:
 *         description: List of posts
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, title, description, contactInfo]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [problem, offer]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               budget:
 *                 type: number
 *               location:
 *                 type: string
 *               contactInfo:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string

 *     responses:
 *       201:
 *         description: Post created
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a single post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post found
 *       404:
 *         description: Post not found
 *   put:
 *     summary: Edit a post (owner only)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Post updated
 *       400:
 *         description: Bad request
 *       404:
 *         description: Post not found
 *   delete:
 *     summary: Delete a post (owner only)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted
 *       404:
 *         description: Post not found
 */

// List all posts (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { type, tags, location } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (location) filter.location = location;
    if (tags) filter.tags = { $in: tags.split(',') };
    const posts = await Post.find(filter).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new post (anonymous or registered)
router.post('/', async (req, res) => {
  try {
    let createdByUserId = null;
    if (req.headers.authorization) {
      try {
        auth(req, res, () => {});
        if (req.user && req.user.userId) {
          createdByUserId = req.user.userId;
        }
      } catch (e) {
        // Ignore auth errors for anonymous posts
      }
    }
    const { type, title, description, budget, location, contactInfo, tags } = req.body;
    const postData = {
      type,
      title,
      description,
      budget,
      location,
      contactInfo,
      tags,
      createdByUserId
    };
    const post = new Post(postData);
    const savedPost = await post.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    // Allow update if user is owner or admin
    if (
      (!post.createdByUserId || post.createdByUserId.toString() !== req.user.userId) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'You are not authorized to update this post' });
    }
    const update = { ...req.body, updatedAt: new Date() };
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    // Allow delete if user is owner or admin
    if (
      (!post.createdByUserId || post.createdByUserId.toString() !== req.user.userId) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'You are not authorized to delete this post' });
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
