
-- ══════════════════════════════════════════════════
-- User roles (MUST be first for has_role function)
-- ══════════════════════════════════════════════════
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'admin')
);

-- ══════════════════════════════════════════════════
-- Timestamp update trigger function
-- ══════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ══════════════════════════════════════════════════
-- Enums
-- ══════════════════════════════════════════════════
CREATE TYPE public.food_preference AS ENUM (
  'Panadería', 'Repostería', 'Básicos', 'Cocina Práctica',
  'Vegano', 'Vegetariano', 'Keto', 'Sin Gluten', 'Sin Azúcar'
);

CREATE TYPE public.thermomix_model AS ENUM ('TM31', 'TM5', 'TM6', 'TM7');

-- ══════════════════════════════════════════════════
-- Profiles table
-- ══════════════════════════════════════════════════
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  thermomix_model thermomix_model,
  food_preferences food_preference[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin')
);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ══════════════════════════════════════════════════
-- Classes table
-- ══════════════════════════════════════════════════
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  long_description TEXT,
  category TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  video_url TEXT,
  pdf_url TEXT,
  instructor TEXT NOT NULL DEFAULT 'Gaby Bernal',
  duration TEXT,
  compatible_models thermomix_model[] DEFAULT '{TM5,TM6,TM7}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published classes" ON public.classes FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage classes" ON public.classes FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'admin')
);

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ══════════════════════════════════════════════════
-- Lessons table
-- ══════════════════════════════════════════════════
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  duration TEXT,
  video_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lessons of published classes" ON public.lessons FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.classes WHERE id = class_id AND is_published = true)
);
CREATE POLICY "Admins can manage lessons" ON public.lessons FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'admin')
);

-- ══════════════════════════════════════════════════
-- Enrolled classes
-- ══════════════════════════════════════════════════
CREATE TABLE public.enrolled_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, class_id)
);

ALTER TABLE public.enrolled_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own enrollments" ON public.enrolled_classes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage enrollments" ON public.enrolled_classes FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'admin')
);

-- ══════════════════════════════════════════════════
-- Purchase attempts (WhatsApp intent tracking)
-- ══════════════════════════════════════════════════
CREATE TABLE public.purchase_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.purchase_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert attempts" ON public.purchase_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all attempts" ON public.purchase_attempts FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin')
);
