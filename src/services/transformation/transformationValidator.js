/**
 * InfoFlip-AI Transformation Output Validator
 * 
 * SIH 2026 Problem Statement ID 26154
 * Module 3: Transformation Engine
 * 
 * Verifies that each generated output satisfies the structural, semantic,
 * and format-specific criteria required by Module 3 and downstream Modules 4 & 5.
 */

import { OUTPUT_FORMAT_IDS } from '../../types/transformation.js';

export function validateOutput(format, content) {
  if (!content) {
    return {
      isValid: false,
      error: 'Generated output content is null or undefined.',
      status: 'needs_regeneration'
    };
  }

  switch (format) {
    case OUTPUT_FORMAT_IDS.LINKEDIN: {
      const text = typeof content === 'string' ? content : content.text;
      if (!text || text.trim().length < 40) {
        return {
          isValid: false,
          error: 'LinkedIn post content is too short or empty (minimum 40 characters).',
          status: 'needs_regeneration'
        };
      }
      return { isValid: true };
    }

    case OUTPUT_FORMAT_IDS.TWITTER: {
      const posts = Array.isArray(content.posts) ? content.posts : (typeof content === 'string' ? [content] : []);
      if (posts.length === 0 || !posts[0] || posts[0].trim().length < 15) {
        return {
          isValid: false,
          error: 'X/Twitter post contains no valid text (minimum 15 characters).',
          status: 'needs_regeneration'
        };
      }
      return { isValid: true };
    }

    case OUTPUT_FORMAT_IDS.EXECUTIVE_SUMMARY: {
      if (typeof content !== 'object') {
        return { isValid: false, error: 'Executive Summary must be a structured object.', status: 'needs_regeneration' };
      }
      if (!content.title || !content.executiveOverview) {
        return { isValid: false, error: 'Executive Summary missing title or executive overview.', status: 'needs_regeneration' };
      }
      if (!Array.isArray(content.keyPoints) || content.keyPoints.length === 0) {
        return { isValid: false, error: 'Executive Summary missing key points.', status: 'needs_regeneration' };
      }
      return { isValid: true };
    }

    case OUTPUT_FORMAT_IDS.ADVISORY: {
      if (typeof content !== 'object') {
        return { isValid: false, error: 'Advisory must be a structured object.', status: 'needs_regeneration' };
      }
      if (!content.title || !content.situation) {
        return { isValid: false, error: 'Advisory missing title or situation assessment.', status: 'needs_regeneration' };
      }
      if (!Array.isArray(content.recommendedActions) || content.recommendedActions.length === 0) {
        return { isValid: false, error: 'Advisory missing recommended actions.', status: 'needs_regeneration' };
      }
      return { isValid: true };
    }

    case OUTPUT_FORMAT_IDS.INFOGRAPHIC: {
      if (typeof content !== 'object') {
        return { isValid: false, error: 'Infographic content must be a structured object.', status: 'needs_regeneration' };
      }
      if (!content.title || !content.callout) {
        return { isValid: false, error: 'Infographic missing title or callout banner.', status: 'needs_regeneration' };
      }
      if (!Array.isArray(content.sections) || content.sections.length === 0) {
        return { isValid: false, error: 'Infographic missing visual sections.', status: 'needs_regeneration' };
      }
      return { isValid: true };
    }

    case OUTPUT_FORMAT_IDS.PRESENTATION: {
      if (typeof content !== 'object') {
        return { isValid: false, error: 'Presentation must be a structured slide deck object.', status: 'needs_regeneration' };
      }
      if (!content.title || !Array.isArray(content.slides) || content.slides.length === 0) {
        return { isValid: false, error: 'Presentation missing master title or slides array.', status: 'needs_regeneration' };
      }
      // Check each slide has title and bullets
      const invalidSlide = content.slides.find(s => !s.title || !Array.isArray(s.bullets) || s.bullets.length === 0);
      if (invalidSlide) {
        return {
          isValid: false,
          error: `Slide ${invalidSlide.slideNumber || 'unknown'} is missing title or bullet points.`,
          status: 'needs_regeneration'
        };
      }
      return { isValid: true };
    }

    case OUTPUT_FORMAT_IDS.VIDEO_SCRIPT: {
      if (typeof content !== 'object') {
        return { isValid: false, error: 'Video Script must be a structured storyboard object.', status: 'needs_regeneration' };
      }
      if (!content.title || !Array.isArray(content.scenes) || content.scenes.length === 0) {
        return { isValid: false, error: 'Video Script missing title or storyboard scenes.', status: 'needs_regeneration' };
      }
      const invalidScene = content.scenes.find(s => !s.visual || !s.narration);
      if (invalidScene) {
        return {
          isValid: false,
          error: `Scene ${invalidScene.sceneNumber || 'unknown'} missing visual description or voiceover narration.`,
          status: 'needs_regeneration'
        };
      }
      return { isValid: true };
    }

    default:
      if (!content) {
        return { isValid: false, error: `Output for format ${format} is empty.`, status: 'needs_regeneration' };
      }
      return { isValid: true };
  }
}
