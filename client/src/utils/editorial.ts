import type { Blog } from './types';
import heroImage from '../assets/generated/blogit-hero.png';
import travelImage from '../assets/generated/blogit-travel.png';
import designImage from '../assets/generated/blogit-design.png';
import cafeImage from '../assets/generated/blogit-cafe.png';

export const heroEditorialImage = heroImage;

export const editorialImages = [travelImage, designImage, cafeImage, heroImage];

export const formatDisplayDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

const getBlogKey = (blog: Pick<Blog, '_id' | 'slug' | 'title'>) => blog.slug || blog._id || blog.title;

const getVisualIndex = (key: string) =>
  key.split('').reduce((total, char) => total + char.charCodeAt(0), 0);

export const getEditorialImage = (blog: Pick<Blog, '_id' | 'slug' | 'title' | 'coverImageUrl'>) => {
  if (blog.coverImageUrl) {
    return blog.coverImageUrl;
  }
  const index = getVisualIndex(getBlogKey(blog)) % editorialImages.length;
  return editorialImages[index];
};
