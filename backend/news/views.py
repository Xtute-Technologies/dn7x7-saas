from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import connections  # <--- CHANGED: Import connections instead of connection
from .authentication import APIKeyAuthentication
from .serializers import MinimalNewsSerializer, FullNewsSerializer
from .constants import CATEGORY_MAPPING, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE

class PartnerNewsListView(APIView):
    """
    API endpoint for external partners to access news content.
    Credit deduction and Logging are handled by APICreditMiddleware.
    """
    authentication_classes = [APIKeyAuthentication]

    def get(self, request):
        # Get query parameters
        category_slug = request.query_params.get('category', None)
        try:
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', DEFAULT_PAGE_SIZE))
        except ValueError:
            page = 1
            page_size = DEFAULT_PAGE_SIZE

        # Enforce page size limits
        page_size = min(page_size, MAX_PAGE_SIZE)
        
        # Calculate offset
        offset = (page - 1) * page_size
        
        # Get category IDs from mapping
        category_ids = None
        if category_slug and category_slug.lower() in CATEGORY_MAPPING:
            category_ids = CATEGORY_MAPPING[category_slug.lower()]
        
        # Fetch news
        posts, total_count = self.fetch_news_from_wordpress(category_ids, page_size, offset)
        
        # Serialize data
        serializer = MinimalNewsSerializer(posts, many=True)
        
        # Prepare response with pagination info
        response_data = {
            'results': serializer.data,
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size,
        }
        
        return Response(response_data, status=status.HTTP_200_OK)

    def fetch_news_from_wordpress(self, category_ids, limit, offset):
        """
        Fetch news from WordPress database ('news_db').
        """
        if category_ids:
            # Filter by category
            query = """
                SELECT DISTINCT 
                    p.ID, p.post_date, p.post_date_gmt, p.post_content, p.post_title,
                    p.post_name, p.post_status, p.guid, p.post_modified, p.post_modified_gmt,
                    pm.meta_value as featured_media_id,
                    wp_media.guid as featured_media_url
                FROM wp_posts p
                JOIN wp_term_relationships tr ON p.ID = tr.object_id
                JOIN wp_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
                LEFT JOIN wp_postmeta pm ON p.ID = pm.post_id AND pm.meta_key = '_thumbnail_id'
                LEFT JOIN wp_posts wp_media ON pm.meta_value = wp_media.ID AND wp_media.post_type = 'attachment'
                WHERE p.post_type = 'post' 
                    AND p.post_status = 'publish'
                    AND tt.taxonomy = 'category'
                    AND tt.term_id IN ({})
                ORDER BY p.post_date DESC
                LIMIT %s OFFSET %s
            """.format(','.join(['%s'] * len(category_ids)))
            
            count_query = """
                SELECT COUNT(DISTINCT p.ID)
                FROM wp_posts p
                JOIN wp_term_relationships tr ON p.ID = tr.object_id
                JOIN wp_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
                WHERE p.post_type = 'post' 
                    AND p.post_status = 'publish'
                    AND tt.taxonomy = 'category'
                    AND tt.term_id IN ({})
            """.format(','.join(['%s'] * len(category_ids)))
            
            params = list(category_ids) + [limit, offset]
            count_params = list(category_ids)
        else:
            # No category filter - fetch all published posts
            query = """
                SELECT 
                    p.ID, p.post_date, p.post_date_gmt, p.post_content, p.post_title,
                    p.post_name, p.post_status, p.guid, p.post_modified, p.post_modified_gmt,
                    pm.meta_value as featured_media_id,
                    wp_media.guid as featured_media_url
                FROM wp_posts p
                LEFT JOIN wp_postmeta pm ON p.ID = pm.post_id AND pm.meta_key = '_thumbnail_id'
                LEFT JOIN wp_posts wp_media ON pm.meta_value = wp_media.ID AND wp_media.post_type = 'attachment'
                WHERE p.post_type = 'post' AND p.post_status = 'publish'
                ORDER BY p.post_date DESC
                LIMIT %s OFFSET %s
            """
            
            count_query = """
                SELECT COUNT(*)
                FROM wp_posts p
                WHERE p.post_type = 'post' AND p.post_status = 'publish'
            """
            
            params = [limit, offset]
            count_params = []
        
        # Execute queries using 'news_db' connection
        with connections['news_db'].cursor() as cursor:  # <--- CHANGED
            # Get total count
            cursor.execute(count_query, count_params)
            total_count = cursor.fetchone()[0]
            
            # Get posts
            cursor.execute(query, params)
            if cursor.description:
                columns = [col[0] for col in cursor.description]
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]
            else:
                results = []
        
        # Fetch categories for each post
        posts = []
        for row in results:
            post_data = self.map_post_to_format(row)
            post_data['categories'] = self.fetch_post_categories(row['ID'])
            posts.append(post_data)
        
        return posts, total_count

    def map_post_to_format(self, row):
        """Map database row to post format"""
        return {
            "id": row['ID'],
            "date": row['post_date'],
            "slug": row['post_name'],
            "title": row['post_title'],
            "content": {"rendered": row['post_content']},
            "featured_media_url": row['featured_media_url'],
            "categories": [] 
        }

    def fetch_post_categories(self, post_id):
        """Fetch categories for a given post ID from 'news_db'"""
        query = """
            SELECT t.name 
            FROM wp_terms t
            JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
            JOIN wp_term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
            WHERE tt.taxonomy = 'category' AND tr.object_id = %s
        """
        # Execute using 'news_db' connection
        with connections['news_db'].cursor() as cursor:  # <--- CHANGED
            cursor.execute(query, [post_id])
            categories = [row[0] for row in cursor.fetchall()]
        return categories


class PartnerNewsDetailView(APIView):
    """
    API endpoint for external partners to access a single news article.
    """
    authentication_classes = [APIKeyAuthentication]

    def get(self, request, post_id):
        post = self.fetch_single_news_from_wordpress(post_id)
        
        if not post:
            return Response({'error': 'News not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = FullNewsSerializer(post)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def fetch_single_news_from_wordpress(self, post_id):
        query = """
            SELECT 
                p.ID, p.post_date, p.post_date_gmt, p.post_content, p.post_title,
                p.post_name, p.post_status, p.guid, p.post_modified, p.post_modified_gmt,
                pm.meta_value as featured_media_id,
                wp_media.guid as featured_media_url
            FROM wp_posts p
            LEFT JOIN wp_postmeta pm ON p.ID = pm.post_id AND pm.meta_key = '_thumbnail_id'
            LEFT JOIN wp_posts wp_media ON pm.meta_value = wp_media.ID AND wp_media.post_type = 'attachment'
            WHERE p.post_type = 'post' AND p.post_status = 'publish' AND p.ID = %s
        """
        # Execute using 'news_db' connection
        with connections['news_db'].cursor() as cursor:  # <--- CHANGED
            cursor.execute(query, [post_id])
            if cursor.description:
                columns = [col[0] for col in cursor.description]
                row = cursor.fetchone()
                if not row:
                    return None
                result = dict(zip(columns, row))
            else:
                return None

        post_data = self.map_post_to_format(result)
        post_data['categories'] = self.fetch_post_categories(result['ID'])
        
        return post_data

    def map_post_to_format(self, row):
        return {
            "id": row['ID'],
            "date": row['post_date'],
            "slug": row['post_name'],
            "title": row['post_title'],
            "content": {"rendered": row['post_content']},
            "featured_media_url": row['featured_media_url'],
            "categories": []
        }

    def fetch_post_categories(self, post_id):
        query = """
            SELECT t.name 
            FROM wp_terms t
            JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
            JOIN wp_term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
            WHERE tt.taxonomy = 'category' AND tr.object_id = %s
        """
        # Execute using 'news_db' connection
        with connections['news_db'].cursor() as cursor:  # <--- CHANGED
            cursor.execute(query, [post_id])
            categories = [row[0] for row in cursor.fetchall()]
        return categories