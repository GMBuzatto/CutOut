import sharp from 'sharp';
import path from 'path';

export interface ProcessResult {
  success: boolean;
  error?: string;
  method?: string;
}

export class ImageProcessor {
  
  /**
   * Remove background from image using advanced detection and removal techniques
   */
  async removeBackground(inputPath: string, outputPath: string): Promise<ProcessResult> {
    try {
      const image = sharp(inputPath);
      const metadata = await image.metadata();
      
      console.log(`🔍 Processing: ${path.basename(inputPath)}`);
      console.log(`📐 Size: ${metadata.width}x${metadata.height}, Format: ${metadata.format}`);

      // Get raw image data for analysis
      const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
      console.log(`📊 Image info: ${info.channels} channels`);

      // Method 1: Advanced background detection
      console.log('🎯 Method 1: Advanced Background Detection...');
      const result1 = await this.advancedBackgroundDetection(data, info, outputPath);
      if (result1.success) {
        console.log('✅ Success with Advanced Background Detection');
        return { success: true, method: 'Advanced Background Detection' };
      }

      // Method 2: Flood fill from edges
      console.log('🌊 Method 2: Flood Fill Detection...');
      const result2 = await this.floodFillBackgroundRemoval(data, info, outputPath);
      if (result2.success) {
        console.log('✅ Success with Flood Fill Detection');
        return { success: true, method: 'Flood Fill Background Removal' };
      }

      // Method 3: Statistical background separation
      console.log('📈 Method 3: Statistical Background Separation...');
      const result3 = await this.statisticalBackgroundSeparation(data, info, outputPath);
      if (result3.success) {
        console.log('✅ Success with Statistical Background Separation');
        return { success: true, method: 'Statistical Background Separation' };
      }

      // Method 4: Aggressive edge-based removal
      console.log('⚡ Method 4: Aggressive Edge Processing...');
      const result4 = await this.aggressiveEdgeProcessing(image, data, info, outputPath);
      if (result4.success) {
        console.log('✅ Success with Aggressive Edge Processing');
        return { success: true, method: 'Aggressive Edge Processing' };
      }

      // Method 5: Force background removal
      console.log('🔥 Method 5: Forced Background Removal...');
      await this.forceBackgroundRemoval(data, info, outputPath);
      return { 
        success: true, 
        method: 'Forced Background Removal',
        error: 'Applied aggressive background removal as fallback'
      };

    } catch (error) {
      console.error('❌ Processing error:', error);
      return { 
        success: false, 
        error: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Advanced background detection using multiple sampling techniques
   */
  private async advancedBackgroundDetection(data: Buffer, info: any, outputPath: string): Promise<ProcessResult> {
    try {
      // Sample multiple regions to find background
      const backgroundRegions = this.sampleBackgroundRegions(data, info.width, info.height, info.channels);
      console.log(`📍 Sampled ${backgroundRegions.length} background regions`);

      if (backgroundRegions.length === 0) return { success: false };

      // Analyze color clusters
      const colorClusters = this.analyzeColorClusters(backgroundRegions);
      console.log(`🎨 Found ${colorClusters.length} color clusters`);

      for (let i = 0; i < colorClusters.length; i++) {
        const cluster = colorClusters[i];
        console.log(`   Cluster ${i + 1}: RGB(${cluster.color.r}, ${cluster.color.g}, ${cluster.color.b}) - ${cluster.count} pixels`);

        // More aggressive tolerance levels for better background removal
        for (const tolerance of [35, 55, 75, 95]) {
          const mask = this.createProtectedMask(data, info.width, info.height, info.channels, cluster.color, tolerance);
          const stats = this.analyzeMaskStatistics(mask);
          
          console.log(`     Tolerance ${tolerance}: ${stats.removedPercentage.toFixed(1)}% removed, ${stats.connectedRegions} regions`);
          
          // More permissive criteria
          if (stats.removedPercentage >= 15 && stats.removedPercentage <= 80 && stats.connectedRegions <= 6) {
            if (this.validateObjectPreservation(mask, info.width, info.height)) {
              await this.applyMaskAndSave(data, mask, info, outputPath);
              console.log(`✅ Applied enhanced background removal with tolerance ${tolerance}`);
              return { success: true };
            }
          }
        }
      }

      return { success: false };
    } catch (error) {
      console.log('❌ Advanced detection failed:', error);
      return { success: false };
    }
  }

  /**
   * Flood fill algorithm with enhanced background detection
   */
  private async floodFillBackgroundRemoval(data: Buffer, info: any, outputPath: string): Promise<ProcessResult> {
    try {
      console.log('🌊 Starting enhanced flood fill from edges...');
      
      const mask = this.createEnhancedFloodFillMask(data, info.width, info.height, info.channels);
      const stats = this.analyzeMaskStatistics(mask);
      
      console.log(`   Flood fill result: ${stats.removedPercentage.toFixed(1)}% removed`);
      
      // More permissive criteria
      if (stats.removedPercentage >= 10 && stats.removedPercentage <= 85 && this.validateObjectPreservation(mask, info.width, info.height)) {
        await this.applyMaskAndSave(data, mask, info, outputPath);
        return { success: true };
      }

      return { success: false };
    } catch (error) {
      console.log('❌ Flood fill failed:', error);
      return { success: false };
    }
  }

  /**
   * Statistical analysis with enhanced background detection
   */
  private async statisticalBackgroundSeparation(data: Buffer, info: any, outputPath: string): Promise<ProcessResult> {
    try {
      console.log('📊 Enhanced statistical analysis...');
      
      // Create histogram of colors
      const colorHistogram = this.createColorHistogram(data, info.width, info.height, info.channels);
      const dominantColors = this.findDominantColors(colorHistogram, 7); // More colors to analyze
      
      console.log(`   Found ${dominantColors.length} dominant colors:`);
      dominantColors.forEach((color, i) => {
        console.log(`     ${i + 1}. RGB(${color.r}, ${color.g}, ${color.b}) - ${color.frequency.toFixed(1)}%`);
      });

      // Try removing each dominant color that appears to be background
      for (const dominantColor of dominantColors) {
        if (dominantColor.frequency < 8) continue; // Lower threshold for more opportunities
        
        // Enhanced background scoring with light color bias
        const backgroundScore = this.calculateEnhancedBackgroundScore(data, info.width, info.height, info.channels, dominantColor);
        console.log(`     Color RGB(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b}) background score: ${backgroundScore.toFixed(2)}`);
        
        if (backgroundScore >= 0.5) { // Lower threshold for more aggressive removal
          for (const tolerance of [40, 60, 80, 100]) { // Higher tolerances
            const mask = this.createProtectedMask(data, info.width, info.height, info.channels, dominantColor, tolerance);
            const stats = this.analyzeMaskStatistics(mask);
            
            console.log(`       Tolerance ${tolerance}: ${stats.removedPercentage.toFixed(1)}% removed`);
            
            // More permissive criteria
            if (stats.removedPercentage >= 15 && stats.removedPercentage <= 80 && this.validateObjectPreservation(mask, info.width, info.height)) {
              await this.applyMaskAndSave(data, mask, info, outputPath);
              console.log(`✅ Removed background color RGB(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b}) effectively`);
              return { success: true };
            }
          }
        }
      }

      return { success: false };
    } catch (error) {
      console.log('❌ Statistical separation failed:', error);
      return { success: false };
    }
  }

  /**
   * Enhanced edge processing
   */
  private async aggressiveEdgeProcessing(image: sharp.Sharp, data: Buffer, info: any, outputPath: string): Promise<ProcessResult> {
    try {
      console.log('⚡ Applying enhanced edge processing...');
      
      // Create enhanced edge detection
      const edgeBuffer = await image
        .clone()
        .greyscale()
        .blur(0.6) // Less blur for better edge detection
        .normalise()
        .convolve({
          width: 3,
          height: 3,
          kernel: [-1, -2, -1, 0, 0, 0, 1, 2, 1]
        })
        .toBuffer();

      // Create mask with enhanced edge processing
      const mask = this.createEnhancedEdgeMask(data, edgeBuffer, info.width, info.height, info.channels);
      const stats = this.analyzeMaskStatistics(mask);
      
      console.log(`   Edge processing result: ${stats.removedPercentage.toFixed(1)}% removed`);
      
      // More permissive criteria
      if (stats.removedPercentage >= 10 && stats.removedPercentage <= 85 && this.validateObjectPreservation(mask, info.width, info.height)) {
        await this.applyMaskAndSave(data, mask, info, outputPath);
        return { success: true };
      }

      return { success: false };
    } catch (error) {
      console.log('❌ Edge processing failed:', error);
      return { success: false };
    }
  }

  /**
   * Force background removal with enhanced detection
   */
  private async forceBackgroundRemoval(data: Buffer, info: any, outputPath: string): Promise<void> {
    console.log('🔥 Applying enhanced background removal...');
    
    try {
      // Find light/neutral background colors more aggressively
      const backgroundCandidate = this.findMostLikelyBackgroundColor(data, info.width, info.height, info.channels);
      
      if (backgroundCandidate) {
        console.log(`   Testing background candidate: RGB(${backgroundCandidate.r}, ${backgroundCandidate.g}, ${backgroundCandidate.b})`);
        
        // Test more aggressive tolerances
        for (const tolerance of [50, 70, 90, 110]) {
          const mask = this.createEnhancedProtectedMask(data, info.width, info.height, info.channels, backgroundCandidate, tolerance);
          const stats = this.analyzeMaskStatistics(mask);
          
          console.log(`     Tolerance ${tolerance}: ${stats.removedPercentage.toFixed(1)}% would be removed`);
          
          // More permissive criteria
          if (stats.removedPercentage >= 10 && stats.removedPercentage <= 80 && this.validateObjectPreservation(mask, info.width, info.height)) {
            await this.applyMaskAndSave(data, mask, info, outputPath);
            console.log(`✅ Applied enhanced removal with tolerance ${tolerance}`);
            return;
          }
        }
      }
      
      // Try light color removal as fallback
      console.log('🔧 Trying light background removal...');
      const lightMask = this.createLightBackgroundMask(data, info.width, info.height, info.channels);
      const lightStats = this.analyzeMaskStatistics(lightMask);
      
      console.log(`   Light background removal: ${lightStats.removedPercentage.toFixed(1)}% would be removed`);
      if (lightStats.removedPercentage >= 8 && lightStats.removedPercentage <= 70 && this.validateObjectPreservation(lightMask, info.width, info.height)) {
        await this.applyMaskAndSave(data, lightMask, info, outputPath);
        console.log('✅ Applied light background removal');
        return;
      }
      
      // More permissive corner processing
      console.log('🔧 Applying enhanced corner processing...');
      const cornerMask = this.createEnhancedCornerMask(data, info.width, info.height, info.channels);
      const cornerStats = this.analyzeMaskStatistics(cornerMask);
      
      console.log(`   Corner processing: ${cornerStats.removedPercentage.toFixed(1)}% would be removed`);
      if (cornerStats.removedPercentage >= 5) { // Accept even minimal corner processing
        await this.applyMaskAndSave(data, cornerMask, info, outputPath);
        console.log('✅ Applied enhanced corner processing');
        return;
      }
      
    } catch (error) {
      console.log('❌ Enhanced removal error, creating fallback PNG:', error);
      
      try {
        // Ultimate fallback
        const rgbaBuffer = Buffer.alloc(info.width * info.height * 4);
        
        for (let i = 0; i < info.width * info.height; i++) {
          const rgbIndex = i * info.channels;
          const rgbaIndex = i * 4;
          
          rgbaBuffer[rgbaIndex] = data[rgbIndex];
          rgbaBuffer[rgbaIndex + 1] = data[rgbIndex + 1];
          rgbaBuffer[rgbaIndex + 2] = data[rgbIndex + 2];
          rgbaBuffer[rgbaIndex + 3] = 255;
        }
        
        await sharp(rgbaBuffer, { 
          raw: { 
            width: info.width, 
            height: info.height, 
            channels: 4
          } 
        })
          .png()
          .toFile(outputPath);
          
        console.log('✅ Created fallback PNG');
      } catch (fallbackError) {
        console.error('❌ Even fallback failed:', fallbackError);
        throw fallbackError;
      }
    }
  }

  // Helper methods

  private sampleBackgroundRegions(data: Buffer, width: number, height: number, channels: number): number[][] {
    const samples: number[][] = [];
    const borderSize = Math.max(10, Math.min(width, height) * 0.05);
    
    // Sample corners more densely
    const regions = [
      { x: 0, y: 0, w: borderSize * 2, h: borderSize * 2 }, // Top-left
      { x: width - borderSize * 2, y: 0, w: borderSize * 2, h: borderSize * 2 }, // Top-right
      { x: 0, y: height - borderSize * 2, w: borderSize * 2, h: borderSize * 2 }, // Bottom-left
      { x: width - borderSize * 2, y: height - borderSize * 2, w: borderSize * 2, h: borderSize * 2 }, // Bottom-right
    ];

    for (const region of regions) {
      for (let y = Math.max(0, region.y); y < Math.min(height, region.y + region.h); y += 2) {
        for (let x = Math.max(0, region.x); x < Math.min(width, region.x + region.w); x += 2) {
          const idx = (y * width + x) * channels;
          if (idx + 2 < data.length) {
            samples.push([data[idx], data[idx + 1], data[idx + 2]]);
          }
        }
      }
    }

    return samples;
  }

  private analyzeColorClusters(pixels: number[][]): Array<{ color: { r: number, g: number, b: number }, count: number }> {
    const clusters: { [key: string]: number } = {};
    
    // Group colors with tolerance
    for (const pixel of pixels) {
      const key = `${Math.round(pixel[0] / 15) * 15},${Math.round(pixel[1] / 15) * 15},${Math.round(pixel[2] / 15) * 15}`;
      clusters[key] = (clusters[key] || 0) + 1;
    }

    // Convert to array and sort by frequency
    return Object.entries(clusters)
      .map(([key, count]) => {
        const [r, g, b] = key.split(',').map(Number);
        return { color: { r, g, b }, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 clusters
  }

  private createProtectedMask(data: Buffer, width: number, height: number, channels: number, targetColor: { r: number, g: number, b: number }, tolerance: number): Buffer {
    const mask = Buffer.alloc(width * height, 255);
    const protectedZone = this.createProtectedZone(width, height);
    
    for (let i = 0; i < width * height; i++) {
      const pixelIdx = i * channels;
      const x = i % width;
      const y = Math.floor(i / width);
      
      // Skip protected center area
      if (protectedZone[i]) {
        continue;
      }
      
      const r = data[pixelIdx];
      const g = data[pixelIdx + 1];
      const b = data[pixelIdx + 2];
      
      // Calculate distance to target color
      const distance = Math.sqrt(
        Math.pow(r - targetColor.r, 2) * 0.3 +
        Math.pow(g - targetColor.g, 2) * 0.59 +
        Math.pow(b - targetColor.b, 2) * 0.11
      );
      
      // Apply distance-based transparency, but only if not in protected zone
      if (distance <= tolerance * 0.6) {
        mask[i] = 0; // Fully transparent
      } else if (distance <= tolerance) {
        mask[i] = Math.round((distance - tolerance * 0.6) / (tolerance * 0.4) * 255);
      }
    }
    
    return mask;
  }

  /**
   * Create protected zone map to avoid removing object center
   */
  private createProtectedZone(width: number, height: number): Buffer {
    const protectedZone = Buffer.alloc(width * height, 0);
    
    // Protect larger center region (50% of image) to better preserve objects
    const protectSize = Math.min(width, height) * 0.5;
    const centerX = width / 2;
    const centerY = height / 2;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        
        // Create elliptical protected zone
        const distanceFromCenter = Math.sqrt(
          Math.pow((x - centerX) / (protectSize / 2), 2) +
          Math.pow((y - centerY) / (protectSize / 2), 2)
        );
        
        if (distanceFromCenter <= 1) {
          protectedZone[idx] = 1; // Protected
        }
      }
    }
    
    return protectedZone;
  }

  /**
   * Validate that object is preserved (enhanced validation)
   */
  private validateObjectPreservation(mask: Buffer, width: number, height: number): boolean {
    // Check center region for holes
    const centerSize = Math.min(width, height) * 0.3; // Smaller validation area
    const centerX = width / 2 - centerSize / 2;
    const centerY = height / 2 - centerSize / 2;
    
    let removedInCenter = 0;
    let totalCenterPixels = 0;
    
    for (let y = Math.max(0, centerY); y < Math.min(height, centerY + centerSize); y++) {
      for (let x = Math.max(0, centerX); x < Math.min(width, centerX + centerSize); x++) {
        const idx = y * width + x;
        totalCenterPixels++;
        
        if (mask[idx] === 0) { // Removed pixel
          removedInCenter++;
        }
      }
    }
    
    const centerRemovalRatio = totalCenterPixels > 0 ? removedInCenter / totalCenterPixels : 0;
    console.log(`   Object preservation check: ${(centerRemovalRatio * 100).toFixed(1)}% center removed`);
    
    // More permissive: allow up to 12% removal in center area
    if (centerRemovalRatio > 0.12) {
      console.log(`   ❌ Too much center removal (${(centerRemovalRatio * 100).toFixed(1)}% > 12%)`);
      return false;
    }

    // Check for problematic holes only in the core center area
    const hasProblematicHoles = this.checkForProblematicHoles(mask, width, height);
    if (hasProblematicHoles) {
      console.log(`   ❌ Problematic holes detected in core object area`);
      return false;
    }

    return true;
  }

  /**
   * Check for truly problematic holes that indicate object damage (more intelligent)
   */
  private checkForProblematicHoles(mask: Buffer, width: number, height: number): boolean {
    const visited = new Set<number>();
    // Check only the core center area (smaller than before)
    const centerSize = Math.min(width, height) * 0.25; // Much smaller core area
    const centerX = width / 2 - centerSize / 2;
    const centerY = height / 2 - centerSize / 2;
    
    // Look for holes (removed regions) only in the very center
    for (let y = Math.max(0, centerY); y < Math.min(height, centerY + centerSize); y++) {
      for (let x = Math.max(0, centerX); x < Math.min(width, centerX + centerSize); x++) {
        const idx = y * width + x;
        
        if (mask[idx] === 0 && !visited.has(idx)) { // Found a hole
          const holeSize = this.measureHoleSize(mask, x, y, width, height, visited);
          
          // Much more permissive - only flag very large holes in the very center
          const imageArea = width * height;
          const holeRatio = holeSize / imageArea;
          
          // Only flag holes bigger than 5% of total image in the core center
          if (holeRatio > 0.05) {
            console.log(`   Detected large hole: ${(holeRatio * 100).toFixed(1)}% of image`);
            return true;
          }
        }
      }
    }
    
    return false;
  }

  /**
   * Measure the size of a hole using flood fill
   */
  private measureHoleSize(mask: Buffer, startX: number, startY: number, width: number, height: number, visited: Set<number>): number {
    const queue: Array<{ x: number, y: number }> = [{ x: startX, y: startY }];
    let holeSize = 0;
    
    while (queue.length > 0) {
      const { x, y } = queue.shift()!;
      const idx = y * width + x;
      
      if (x < 0 || x >= width || y < 0 || y >= height || visited.has(idx) || mask[idx] !== 0) {
        continue;
      }
      
      visited.add(idx);
      holeSize++;
      
      // Add neighbors
      queue.push({ x: x + 1, y });
      queue.push({ x: x - 1, y });
      queue.push({ x, y: y + 1 });
      queue.push({ x, y: y - 1 });
    }
    
    return holeSize;
  }

  /**
   * Enhanced flood fill with better object protection
   */
  private enhancedFloodFill(data: Buffer, mask: Buffer, visited: Set<number>, protectedZone: Buffer, startX: number, startY: number, width: number, height: number, channels: number, tolerance: number): void {
    const queue: Array<{ x: number, y: number }> = [{ x: startX, y: startY }];
    const startIdx = (startY * width + startX) * channels;
    const startColor = {
      r: data[startIdx],
      g: data[startIdx + 1],
      b: data[startIdx + 2]
    };

    let processedPixels = 0;
    const maxPixels = (width * height) * 0.65; // Allow more pixels again

    while (queue.length > 0 && processedPixels < maxPixels) {
      const { x, y } = queue.shift()!;
      const index = y * width + x;
      
      if (x < 0 || x >= width || y < 0 || y >= height || visited.has(index) || protectedZone[index]) {
        continue;
      }

      const pixelIdx = index * channels;
      const pixelColor = {
        r: data[pixelIdx],
        g: data[pixelIdx + 1],
        b: data[pixelIdx + 2]
      };

      // Enhanced color distance calculation
      const distance = Math.sqrt(
        Math.pow(pixelColor.r - startColor.r, 2) * 0.3 +
        Math.pow(pixelColor.g - startColor.g, 2) * 0.59 +
        Math.pow(pixelColor.b - startColor.b, 2) * 0.11
      );

      // Less aggressive tolerance reduction
      const edgeDistance = Math.min(x, width - x, y, height - y);
      const maxEdgeDistance = Math.min(width, height) * 0.4; // Larger area for tolerance reduction
      const distanceFactor = Math.min(1, edgeDistance / maxEdgeDistance);
      const adjustedTolerance = tolerance * (1 - distanceFactor * 0.2); // Less reduction

      if (distance <= adjustedTolerance) {
        visited.add(index);
        mask[index] = 0; // Mark as background
        processedPixels++;
        
        // Add neighbors to queue
        queue.push({ x: x + 1, y });
        queue.push({ x: x - 1, y });
        queue.push({ x, y: y + 1 });
        queue.push({ x, y: y - 1 });
      }
    }
  }

  /**
   * Create enhanced flood fill mask with better starting point selection
   */
  private createEnhancedFloodFillMask(data: Buffer, width: number, height: number, channels: number): Buffer {
    const mask = Buffer.alloc(width * height, 255);
    const visited = new Set<number>();
    const protectedZone = this.createProtectedZone(width, height);
    
    // More starting points for better coverage
    const startPoints: Array<{ x: number, y: number }> = [
      { x: 0, y: 0 }, // Corners
      { x: width - 1, y: 0 },
      { x: 0, y: height - 1 },
      { x: width - 1, y: height - 1 },
    ];

    // Add edge midpoints only if they are likely background
    const edgeMidpoints = [
      { x: Math.floor(width / 2), y: 0 },
      { x: Math.floor(width / 2), y: height - 1 },
      { x: 0, y: Math.floor(height / 2) },
      { x: width - 1, y: Math.floor(height / 2) },
    ];

    for (const point of edgeMidpoints) {
      if (this.isLikelyBackgroundPixel(data, point.x, point.y, width, height, channels)) {
        startPoints.push(point);
      }
    }

    // Add quarter points for better coverage
    const quarterPoints = [
      { x: Math.floor(width / 4), y: 0 },
      { x: Math.floor(3 * width / 4), y: 0 },
      { x: Math.floor(width / 4), y: height - 1 },
      { x: Math.floor(3 * width / 4), y: height - 1 },
      { x: 0, y: Math.floor(height / 4) },
      { x: 0, y: Math.floor(3 * height / 4) },
      { x: width - 1, y: Math.floor(height / 4) },
      { x: width - 1, y: Math.floor(3 * height / 4) },
    ];

    for (const point of quarterPoints) {
      if (this.isLikelyBackgroundPixel(data, point.x, point.y, width, height, channels)) {
        startPoints.push(point);
      }
    }

    console.log(`   Using ${startPoints.length} flood fill starting points`);

    for (const start of startPoints) {
      this.enhancedFloodFill(data, mask, visited, protectedZone, start.x, start.y, width, height, channels, 40); // Back to 40 tolerance
    }

    return mask;
  }

  /**
   * Check if a pixel is likely to be background (more permissive)
   */
  private isLikelyBackgroundPixel(data: Buffer, x: number, y: number, width: number, height: number, channels: number): boolean {
    const idx = (y * width + x) * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    
    // Check if it's a light or neutral color (common in backgrounds)
    const lightness = (r + g + b) / 3;
    const colorVariation = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
    
    // More permissive: accept more colors as potential background
    return lightness > 120 || colorVariation < 50;
  }

  /**
   * Create enhanced protected mask with better removal criteria
   */
  private createEnhancedProtectedMask(data: Buffer, width: number, height: number, channels: number, targetColor: { r: number, g: number, b: number }, tolerance: number): Buffer {
    const mask = Buffer.alloc(width * height, 255);
    const protectedZone = this.createProtectedZone(width, height);
    
    for (let i = 0; i < width * height; i++) {
      const pixelIdx = i * channels;
      
      // Skip protected center area
      if (protectedZone[i]) {
        continue;
      }
      
      const r = data[pixelIdx];
      const g = data[pixelIdx + 1];
      const b = data[pixelIdx + 2];
      
      // Enhanced color distance calculation
      const distance = Math.sqrt(
        Math.pow(r - targetColor.r, 2) * 0.3 +
        Math.pow(g - targetColor.g, 2) * 0.59 +
        Math.pow(b - targetColor.b, 2) * 0.11
      );
      
      // More permissive removal
      const x = i % width;
      const y = Math.floor(i / width);
      const edgeDistance = Math.min(x, width - x, y, height - y);
      const maxEdgeDistance = Math.min(width, height) * 0.35; // Larger edge area
      
      // Allow removal further from edges
      if (distance <= tolerance * 0.7) {
        mask[i] = 0; // Fully transparent
      } else if (distance <= tolerance && edgeDistance <= maxEdgeDistance) {
        mask[i] = Math.round((distance - tolerance * 0.7) / (tolerance * 0.3) * 255);
      }
    }
    
    return mask;
  }

  /**
   * Enhanced background scoring with better object detection bias
   */
  private calculateEnhancedBackgroundScore(data: Buffer, width: number, height: number, channels: number, targetColor: { r: number, g: number, b: number }): number {
    let score = 0;
    const tolerance = 40;
    
    // Factor 1: Edge presence (0-0.35 points)
    const edgePresence = this.calculateEdgePresence(data, width, height, channels, targetColor, tolerance);
    score += edgePresence * 0.35;
    
    // Factor 2: Corner concentration (0-0.3 points)
    const cornerConcentration = this.calculateCornerConcentration(data, width, height, channels, targetColor, tolerance);
    score += cornerConcentration * 0.3;
    
    // Factor 3: Center absence (0-0.25 points)
    const centerAbsence = this.calculateCenterAbsence(data, width, height, channels, targetColor, tolerance);
    score += centerAbsence * 0.25;
    
    // Factor 4: Light/neutral color bias (0-0.1 points) - reduced weight
    const lightness = (targetColor.r + targetColor.g + targetColor.b) / 3;
    const isNeutral = Math.abs(targetColor.r - targetColor.g) < 30 && Math.abs(targetColor.g - targetColor.b) < 30;
    if (lightness > 150 || isNeutral) {
      score += 0.1;
    }
    
    return Math.min(score, 1.0);
  }

  private calculateEdgePresence(data: Buffer, width: number, height: number, channels: number, targetColor: { r: number, g: number, b: number }, tolerance: number): number {
    let edgeMatches = 0;
    let totalEdgePixels = 0;
    
    // Check edge pixels
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          const idx = (y * width + x) * channels;
          totalEdgePixels++;
          
          const distance = Math.sqrt(
            Math.pow(data[idx] - targetColor.r, 2) +
            Math.pow(data[idx + 1] - targetColor.g, 2) +
            Math.pow(data[idx + 2] - targetColor.b, 2)
          );
          
          if (distance <= tolerance) {
            edgeMatches++;
          }
        }
      }
    }
    
    return totalEdgePixels > 0 ? edgeMatches / totalEdgePixels : 0;
  }

  private calculateCornerConcentration(data: Buffer, width: number, height: number, channels: number, targetColor: { r: number, g: number, b: number }, tolerance: number): number {
    const cornerSize = Math.min(width, height) * 0.1;
    let cornerMatches = 0;
    let totalCornerPixels = 0;
    
    const corners = [
      { x: 0, y: 0 },
      { x: width - cornerSize, y: 0 },
      { x: 0, y: height - cornerSize },
      { x: width - cornerSize, y: height - cornerSize }
    ];
    
    for (const corner of corners) {
      for (let y = corner.y; y < Math.min(height, corner.y + cornerSize); y++) {
        for (let x = corner.x; x < Math.min(width, corner.x + cornerSize); x++) {
          const idx = (y * width + x) * channels;
          totalCornerPixels++;
          
          const distance = Math.sqrt(
            Math.pow(data[idx] - targetColor.r, 2) +
            Math.pow(data[idx + 1] - targetColor.g, 2) +
            Math.pow(data[idx + 2] - targetColor.b, 2)
          );
          
          if (distance <= tolerance) {
            cornerMatches++;
          }
        }
      }
    }
    
    return totalCornerPixels > 0 ? cornerMatches / totalCornerPixels : 0;
  }

  private calculateCenterAbsence(data: Buffer, width: number, height: number, channels: number, targetColor: { r: number, g: number, b: number }, tolerance: number): number {
    const centerSize = Math.min(width, height) * 0.3;
    const centerX = width / 2 - centerSize / 2;
    const centerY = height / 2 - centerSize / 2;
    
    let centerMatches = 0;
    let totalCenterPixels = 0;
    
    for (let y = Math.max(0, centerY); y < Math.min(height, centerY + centerSize); y++) {
      for (let x = Math.max(0, centerX); x < Math.min(width, centerX + centerSize); x++) {
        const idx = (y * width + x) * channels;
        totalCenterPixels++;
        
        const distance = Math.sqrt(
          Math.pow(data[idx] - targetColor.r, 2) +
          Math.pow(data[idx + 1] - targetColor.g, 2) +
          Math.pow(data[idx + 2] - targetColor.b, 2)
        );
        
        if (distance <= tolerance) {
          centerMatches++;
        }
      }
    }
    
    const centerPresence = totalCenterPixels > 0 ? centerMatches / totalCenterPixels : 0;
    return 1 - centerPresence; // Return absence (inverse of presence)
  }

  /**
   * Find the most likely background color using multiple heuristics
   */
  private findMostLikelyBackgroundColor(data: Buffer, width: number, height: number, channels: number): { r: number, g: number, b: number } | null {
    // Sample corners more densely
    const cornerSamples = this.sampleCorners(data, width, height, channels);
    
    // Find the most frequent corner color
    const cornerColor = this.getMostFrequentColor(cornerSamples);
    
    if (cornerColor) {
      console.log(`   Corner analysis suggests: RGB(${cornerColor.r}, ${cornerColor.g}, ${cornerColor.b})`);
      
      // Validate this color makes sense as background
      const coverage = this.calculateColorCoverage(data, width, height, channels, cornerColor, 50);
      console.log(`   Coverage in image: ${coverage.toFixed(1)}%`);
      
      if (coverage >= 15) { // At least 15% coverage
        return cornerColor;
      }
    }
    
    return null;
  }

  /**
   * Sample corners more thoroughly
   */
  private sampleCorners(data: Buffer, width: number, height: number, channels: number): number[][] {
    const samples: number[][] = [];
    const cornerSize = Math.max(20, Math.min(width, height) * 0.1);
    
    const corners = [
      { x: 0, y: 0 },
      { x: width - cornerSize, y: 0 },
      { x: 0, y: height - cornerSize },
      { x: width - cornerSize, y: height - cornerSize }
    ];
    
    for (const corner of corners) {
      for (let y = corner.y; y < Math.min(height, corner.y + cornerSize); y += 2) {
        for (let x = corner.x; x < Math.min(width, corner.x + cornerSize); x += 2) {
          const idx = (y * width + x) * channels;
          if (idx + 2 < data.length) {
            samples.push([data[idx], data[idx + 1], data[idx + 2]]);
          }
        }
      }
    }
    
    return samples;
  }

  /**
   * Calculate what percentage of the image contains a specific color
   */
  private calculateColorCoverage(data: Buffer, width: number, height: number, channels: number, targetColor: { r: number, g: number, b: number }, tolerance: number): number {
    let matchCount = 0;
    const totalPixels = width * height;
    
    for (let i = 0; i < totalPixels; i++) {
      const pixelIdx = i * channels;
      const distance = Math.sqrt(
        Math.pow(data[pixelIdx] - targetColor.r, 2) +
        Math.pow(data[pixelIdx + 1] - targetColor.g, 2) +
        Math.pow(data[pixelIdx + 2] - targetColor.b, 2)
      );
      
      if (distance <= tolerance) {
        matchCount++;
      }
    }
    
    return (matchCount / totalPixels) * 100;
  }

  /**
   * Create mask targeting light/neutral backgrounds
   */
  private createLightBackgroundMask(data: Buffer, width: number, height: number, channels: number): Buffer {
    const mask = Buffer.alloc(width * height, 255);
    const protectedZone = this.createProtectedZone(width, height);
    
    for (let i = 0; i < width * height; i++) {
      const pixelIdx = i * channels;
      
      // Skip protected center area
      if (protectedZone[i]) {
        continue;
      }
      
      const r = data[pixelIdx];
      const g = data[pixelIdx + 1];
      const b = data[pixelIdx + 2];
      
      // Calculate lightness and neutrality
      const lightness = (r + g + b) / 3;
      const colorVariation = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
      
      // Target light colors (>120) or neutral colors (low variation)
      if (lightness > 120 || colorVariation < 30) {
        const x = i % width;
        const y = Math.floor(i / width);
        
        // Prioritize pixels near edges
        const edgeDistance = Math.min(x, width - x, y, height - y);
        const edgeBonus = Math.max(0, (50 - edgeDistance) / 50);
        
        if (lightness > 140 || colorVariation < 20 || edgeBonus > 0.3) {
          mask[i] = 0; // Remove light/neutral background
        }
      }
    }
    
    return mask;
  }

  private createEnhancedEdgeMask(data: Buffer, edgeData: Buffer, width: number, height: number, channels: number): Buffer {
    const mask = Buffer.alloc(width * height, 255);
    const protectedZone = this.createProtectedZone(width, height);
    
    // Larger border area for more aggressive removal
    const borderSize = Math.min(width, height) * 0.3;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        
        // Skip protected area
        if (protectedZone[idx]) continue;
        
        const edgeValue = edgeData[idx];
        
        // More aggressive: remove pixels with low edge strength
        if (edgeValue < 40) {
          const nearBorder = x < borderSize || x >= width - borderSize || y < borderSize || y >= height - borderSize;
          
          if (nearBorder || this.hasLowEdgeNeighbors(edgeData, x, y, width, height)) {
            mask[idx] = 0; // Mark as background
          }
        }
      }
    }
    
    return mask;
  }

  /**
   * Enhanced corner mask with larger areas
   */
  private createEnhancedCornerMask(data: Buffer, width: number, height: number, channels: number): Buffer {
    const mask = Buffer.alloc(width * height, 255);
    const cornerSize = Math.min(width, height) * 0.1; // Larger corners
    
    const corners = [
      { x: 0, y: 0 },
      { x: width - cornerSize, y: 0 },
      { x: 0, y: height - cornerSize },
      { x: width - cornerSize, y: height - cornerSize }
    ];
    
    for (const corner of corners) {
      const cornerColor = this.getCornerDominantColor(data, corner.x, corner.y, cornerSize, width, height, channels);
      
      if (cornerColor) {
        for (let y = corner.y; y < Math.min(height, corner.y + cornerSize); y++) {
          for (let x = corner.x; x < Math.min(width, corner.x + cornerSize); x++) {
            const idx = y * width + x;
            const pixelIdx = idx * channels;
            
            const distance = Math.sqrt(
              Math.pow(data[pixelIdx] - cornerColor.r, 2) +
              Math.pow(data[pixelIdx + 1] - cornerColor.g, 2) +
              Math.pow(data[pixelIdx + 2] - cornerColor.b, 2)
            );
            
            if (distance <= 40) { // More permissive tolerance
              mask[idx] = 0;
            }
          }
        }
      }
    }
    
    return mask;
  }

  /**
   * Check if pixel has low-edge neighbors (indicating background region)
   */
  private hasLowEdgeNeighbors(edgeData: Buffer, x: number, y: number, width: number, height: number): boolean {
    let lowEdgeCount = 0;
    let totalNeighbors = 0;
    
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = ny * width + nx;
          totalNeighbors++;
          
          if (edgeData[nIdx] < 25) {
            lowEdgeCount++;
          }
        }
      }
    }
    
    return totalNeighbors > 0 && (lowEdgeCount / totalNeighbors) >= 0.7;
  }

  private createColorHistogram(data: Buffer, width: number, height: number, channels: number): Map<string, number> {
    const histogram = new Map<string, number>();
    
    for (let i = 0; i < width * height; i++) {
      const pixelIdx = i * channels;
      const r = Math.round(data[pixelIdx] / 10) * 10;
      const g = Math.round(data[pixelIdx + 1] / 10) * 10;
      const b = Math.round(data[pixelIdx + 2] / 10) * 10;
      const key = `${r},${g},${b}`;
      
      histogram.set(key, (histogram.get(key) || 0) + 1);
    }
    
    return histogram;
  }

  private findDominantColors(histogram: Map<string, number>, count: number): Array<{ r: number, g: number, b: number, frequency: number }> {
    const totalPixels = Array.from(histogram.values()).reduce((sum, count) => sum + count, 0);
    
    return Array.from(histogram.entries())
      .map(([key, pixelCount]) => {
        const [r, g, b] = key.split(',').map(Number);
        return { r, g, b, frequency: (pixelCount / totalPixels) * 100 };
      })
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, count);
  }

  private analyzeMaskStatistics(mask: Buffer): { removedPercentage: number, connectedRegions: number } {
    let removedPixels = 0;
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] === 0) removedPixels++;
    }
    
    const removedPercentage = (removedPixels / mask.length) * 100;
    const connectedRegions = this.countConnectedRegions(mask, Math.sqrt(mask.length), Math.sqrt(mask.length));
    
    return { removedPercentage, connectedRegions };
  }

  private countConnectedRegions(mask: Buffer, width: number, height: number): number {
    const visited = new Set<number>();
    let regions = 0;
    
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] === 0 && !visited.has(i)) {
        this.markConnectedRegion(mask, visited, i, width, height);
        regions++;
      }
    }
    
    return regions;
  }

  private markConnectedRegion(mask: Buffer, visited: Set<number>, start: number, width: number, height: number): void {
    const queue = [start];
    
    while (queue.length > 0) {
      const idx = queue.shift()!;
      if (visited.has(idx)) continue;
      
      visited.add(idx);
      const x = idx % width;
      const y = Math.floor(idx / width);
      
      // Check 4-connected neighbors
      const neighbors = [
        { x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 }
      ];
      
      for (const neighbor of neighbors) {
        if (neighbor.x >= 0 && neighbor.x < width && neighbor.y >= 0 && neighbor.y < height) {
          const nIdx = neighbor.y * width + neighbor.x;
          if (mask[nIdx] === 0 && !visited.has(nIdx)) {
            queue.push(nIdx);
          }
        }
      }
    }
  }

  private async applyMaskAndSave(data: Buffer, mask: Buffer, info: any, outputPath: string): Promise<void> {
    try {
      // Create RGBA buffer by combining original RGB data with alpha mask
      const rgbaBuffer = Buffer.alloc(info.width * info.height * 4);
      
      for (let i = 0; i < info.width * info.height; i++) {
        const rgbIndex = i * info.channels;
        const rgbaIndex = i * 4;
        
        // Copy RGB values
        rgbaBuffer[rgbaIndex] = data[rgbIndex];     // R
        rgbaBuffer[rgbaIndex + 1] = data[rgbIndex + 1]; // G
        rgbaBuffer[rgbaIndex + 2] = data[rgbIndex + 2]; // B
        rgbaBuffer[rgbaIndex + 3] = mask[i];        // A (alpha from mask)
      }
      
      // Create Sharp image from RGBA buffer
      await sharp(rgbaBuffer, { 
        raw: { 
          width: info.width, 
          height: info.height, 
          channels: 4
        } 
      })
        .png()
        .toFile(outputPath);
        
      console.log(`✅ Successfully saved processed image to ${outputPath}`);
    } catch (error) {
      console.error(`❌ Error saving image: ${error}`);
      throw error;
    }
  }

  private getCornerDominantColor(data: Buffer, startX: number, startY: number, size: number, width: number, height: number, channels: number): { r: number, g: number, b: number } | null {
    const samples: number[][] = [];
    
    for (let y = startY; y < Math.min(height, startY + size); y += 2) {
      for (let x = startX; x < Math.min(width, startX + size); x += 2) {
        const idx = (y * width + x) * channels;
        if (idx + 2 < data.length) {
          samples.push([data[idx], data[idx + 1], data[idx + 2]]);
        }
      }
    }
    
    return this.getMostFrequentColor(samples);
  }

  private getMostFrequentColor(pixels: number[][]): { r: number, g: number, b: number } | null {
    if (pixels.length === 0) return null;
    
    const colorCounts: { [key: string]: number } = {};
    
    for (const pixel of pixels) {
      const key = `${Math.round(pixel[0] / 20) * 20},${Math.round(pixel[1] / 20) * 20},${Math.round(pixel[2] / 20) * 20}`;
      colorCounts[key] = (colorCounts[key] || 0) + 1;
    }
    
    const mostFrequent = Object.entries(colorCounts).sort(([,a], [,b]) => b - a)[0];
    if (!mostFrequent) return null;
    
    const [r, g, b] = mostFrequent[0].split(',').map(Number);
    return { r, g, b };
  }
} 