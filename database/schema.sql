-- ============================================
-- Coding Platform Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Profiles Table (User Profiles)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  github_username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- 2. Projects Table
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  
  -- Project Type & Metadata
  type TEXT NOT NULL CHECK (type IN ('scratch', 'scratch-jr', 'vex')),
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  competition TEXT CHECK (competition IN ('CSP-J', 'VEX', 'NOIP')),
  tags TEXT[] DEFAULT '{}',
  
  -- Project Data
  project_data JSONB, -- Scratch project JSON
  project_url TEXT, -- External project URL
  thumbnail_url TEXT,
  
  -- Statistics
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  remix_count INTEGER DEFAULT 0,
  
  -- Status
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_projects_author ON projects(author_id);
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_projects_published ON projects(is_published) WHERE is_published = true;
CREATE INDEX idx_projects_created ON projects(created_at DESC);
CREATE INDEX idx_projects_difficulty ON projects(difficulty);
CREATE INDEX idx_projects_tags ON projects USING GIN(tags);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Published projects are viewable by everyone"
  ON projects FOR SELECT
  USING (is_published = true);

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- 3. Project Likes Table
-- ============================================
CREATE TABLE IF NOT EXISTS project_likes (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, project_id)
);

-- Enable RLS
ALTER TABLE project_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for likes
CREATE POLICY "Likes are viewable by everyone"
  ON project_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like projects"
  ON project_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike projects"
  ON project_likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. Project Comments Table
-- ============================================
CREATE TABLE IF NOT EXISTS project_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for comments
CREATE INDEX idx_comments_project ON project_comments(project_id, created_at DESC);

-- Enable RLS
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments
CREATE POLICY "Comments are viewable by everyone"
  ON project_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON project_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON project_comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Database Functions
-- ============================================

-- Function: Increment view count
CREATE OR REPLACE FUNCTION increment_view_count(project_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE projects
  SET view_count = view_count + 1
  WHERE id = project_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update like count (called by trigger)
CREATE OR REPLACE FUNCTION update_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE projects SET like_count = like_count + 1 WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects SET like_count = like_count - 1 WHERE id = OLD.project_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update like count
DROP TRIGGER IF EXISTS trigger_update_like_count ON project_likes;
CREATE TRIGGER trigger_update_like_count
  AFTER INSERT OR DELETE ON project_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_like_count();

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at for projects
DROP TRIGGER IF EXISTS trigger_projects_updated_at ON projects;
CREATE TRIGGER trigger_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update updated_at for profiles
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Seed Data (Optional - for testing)
-- ============================================

-- Note: Run this manually in Supabase SQL Editor after authentication is set up
-- This will create a test user profile and some sample projects
