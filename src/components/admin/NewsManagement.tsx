import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { z } from 'zod';

// Input validation schema to prevent XSS and data corruption
const newsArticleSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  slug: z.string()
    .max(200, 'Slug must be less than 200 characters')
    .regex(/^[a-z0-9-]*$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .trim()
    .optional()
    .or(z.literal('')),
  category: z.string()
    .min(1, 'Category is required')
    .max(50, 'Category must be less than 50 characters'),
  excerpt: z.string()
    .max(500, 'Excerpt must be less than 500 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  content: z.string()
    .min(1, 'Content is required')
    .max(50000, 'Content must be less than 50,000 characters')
    .trim(),
  is_featured: z.boolean(),
  is_published: z.boolean(),
});

// Sanitize HTML content to prevent XSS attacks
const sanitizeHtml = (html: string): string => {
  // Remove all script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, onload, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol from href and src attributes
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
  sanitized = sanitized.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, '');
  
  // Remove data: protocol from src attributes (can be used for XSS)
  sanitized = sanitized.replace(/src\s*=\s*["']data:[^"']*["']/gi, '');
  
  return sanitized;
};

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  is_featured: boolean;
  is_published: boolean;
  view_count: number;
  published_at: string;
  created_at: string;
}

export const NewsManagement = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'general',
    is_featured: false,
    is_published: false,
  });
  const { toast } = useToast();

  const fetchArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setArticles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setForm({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      is_featured: article.is_featured,
      is_published: article.is_published,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      // Validate input using Zod schema
      const validatedData = newsArticleSchema.parse(form);
      
      // Sanitize HTML content to prevent XSS
      const sanitizedTitle = sanitizeHtml(validatedData.title);
      const sanitizedContent = sanitizeHtml(validatedData.content);
      const sanitizedExcerpt = validatedData.excerpt ? sanitizeHtml(validatedData.excerpt) : '';
      
      // Generate slug if not provided
      const slug = validatedData.slug || sanitizedTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Error', description: 'Not authenticated', variant: 'destructive' });
        return;
      }

      const articleData = {
        title: sanitizedTitle,
        slug,
        category: validatedData.category,
        excerpt: sanitizedExcerpt || null,
        content: sanitizedContent,
        is_featured: validatedData.is_featured,
        is_published: validatedData.is_published,
        author_id: user.id,
        published_at: validatedData.is_published ? new Date().toISOString() : null,
      };

      let error;
      if (editingArticle) {
        ({ error } = await supabase
          .from('news_articles')
          .update(articleData)
          .eq('id', editingArticle.id));
      } else {
        ({ error } = await supabase
          .from('news_articles')
          .insert(articleData));
      }

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Article saved successfully' });
        setShowDialog(false);
        setEditingArticle(null);
        setForm({ title: '', slug: '', excerpt: '', content: '', category: 'general', is_featured: false, is_published: false });
        fetchArticles();
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map(e => e.message).join(', ');
        toast({ 
          title: 'Validation Error', 
          description: errorMessages, 
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: 'Error', 
          description: error.message || 'Failed to save article', 
          variant: 'destructive' 
        });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    const { error } = await supabase
      .from('news_articles')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Article deleted successfully' });
      fetchArticles();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>News Articles</CardTitle>
          <Button onClick={() => { 
            setEditingArticle(null); 
            setForm({ title: '', slug: '', excerpt: '', content: '', category: 'general', is_featured: false, is_published: false }); 
            setShowDialog(true); 
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Article
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : articles.length === 0 ? (
            <p className="text-center text-muted-foreground">No articles yet</p>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <Card key={article.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{article.title}</h3>
                        <Badge variant={article.is_published ? 'default' : 'secondary'}>
                          {article.is_published ? 'Published' : 'Draft'}
                        </Badge>
                        {article.is_featured && <Badge variant="outline">Featured</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="capitalize">{article.category}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {article.view_count}
                        </span>
                        <span>{new Date(article.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(article)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(article.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArticle ? 'Edit Article' : 'Add Article'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title (max 200 characters)</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Article title"
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) - lowercase, numbers, and hyphens only</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                placeholder="article-slug (auto-generated if empty)"
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt (max 500 characters)</Label>
              <Textarea
                id="excerpt"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Brief summary"
                rows={2}
                maxLength={500}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content (max 50,000 characters)</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Article content"
                rows={8}
                maxLength={50000}
              />
              <p className="text-xs text-muted-foreground">
                Content is automatically sanitized to prevent XSS attacks. Use plain text or safe HTML only.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="featured"
                  checked={form.is_featured}
                  onCheckedChange={(checked) => setForm({ ...form, is_featured: checked })}
                />
                <Label htmlFor="featured">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="published"
                  checked={form.is_published}
                  onCheckedChange={(checked) => setForm({ ...form, is_published: checked })}
                />
                <Label htmlFor="published">Published</Label>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Article
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
