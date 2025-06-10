import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import { ImageProcessor } from './services/ImageProcessor';
import { AIBackgroundRemover } from './services/AIBackgroundRemover';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
const outputDir = path.join(__dirname, '../output');

async function ensureDirectories() {
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
  
  try {
    await fs.access(outputDir);
  } catch {
    await fs.mkdir(outputDir, { recursive: true });
  }
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only JPEG, JPG, and PNG files
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, and PNG files are allowed.'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const imageProcessor = new ImageProcessor();
const aiBackgroundRemover = new AIBackgroundRemover();

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// AI capabilities endpoint
app.get('/ai-status', async (req, res) => {
  try {
    res.json({
      removeBackground: {
        apiConfigured: !!process.env.REMOVE_BG_API_KEY,
        enabled: process.env.ENABLE_REMOVE_BG_API === 'true'
      },
      enhancedLocal: {
        available: true,
        description: 'AI-inspired local processing'
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to check AI status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Upload and process endpoint
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    console.log(`Processing upload: ${req.file.originalname} (${req.file.size} bytes)`);

    const inputPath = req.file.path;
    const outputFilename = `processed-${Date.now()}.png`;
    const outputPath = path.join(outputDir, outputFilename);

    // Process the image using AI-enhanced methods first
    console.log('🚀 Starting AI-enhanced background removal...');
    const aiResult = await aiBackgroundRemover.removeBackground(inputPath, outputPath);

    if (aiResult.success) {
      console.log(`AI processing completed successfully using: ${aiResult.method} (${aiResult.processingTime}ms)`);
      
      res.json({
        success: true,
        message: 'Image processed successfully with AI',
        originalImage: `/uploads/${req.file.filename}`,
        processedImage: `/output/${outputFilename}`,
        method: aiResult.method,
        processingTime: aiResult.processingTime,
        confidence: aiResult.confidence,
        error: aiResult.error // Include any warnings
      });
    } else {
      console.log('AI processing failed, falling back to traditional methods...');
      
      // Fallback to traditional processing
      const fallbackResult = await imageProcessor.removeBackground(inputPath, outputPath);

      if (fallbackResult.success) {
        console.log(`Fallback processing completed successfully using: ${fallbackResult.method}`);
        
        res.json({
          success: true,
          message: 'Image processed successfully with fallback method',
          originalImage: `/uploads/${req.file.filename}`,
          processedImage: `/output/${outputFilename}`,
          method: fallbackResult.method,
          fallbackUsed: true,
          error: fallbackResult.error // Include any warnings
        });
      } else {
        console.error(`All processing methods failed: AI - ${aiResult.error}, Fallback - ${fallbackResult.error}`);
        
        res.status(500).json({
          success: false,
          error: `Processing failed: ${aiResult.error}`,
          fallbackError: fallbackResult.error
        });
      }
    }

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to clean up uploaded file:', unlinkError);
      }
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to process image' 
    });
  }
});

// Serve uploaded and processed images
app.use('/uploads', express.static(uploadsDir));
app.use('/output', express.static(outputDir));

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
async function startServer() {
  await ensureDirectories();
  app.listen(PORT, () => {
    console.log(`🚀 CutOut Server running on http://localhost:${PORT}`);
    console.log(`📁 Uploads directory: ${uploadsDir}`);
    console.log(`📁 Output directory: ${outputDir}`);
  });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

startServer().catch(console.error); 