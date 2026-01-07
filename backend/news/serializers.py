from rest_framework import serializers


class MinimalNewsSerializer(serializers.Serializer):
    """
    Minimal news serializer for external partners.
    Contains only essential fields for news aggregation.
    """
    id = serializers.IntegerField()
    title = serializers.CharField()
    excerpt = serializers.SerializerMethodField()
    image = serializers.CharField(source='featured_media_url', allow_null=True)
    url = serializers.SerializerMethodField()
    published_at = serializers.DateTimeField(source='date')
    categories = serializers.ListField(child=serializers.CharField())

    def get_excerpt(self, obj):
        """Truncate content to 150 characters"""
        content = obj.get('content', '')
        if isinstance(content, dict):
            content = content.get('rendered', '')
        
        # Strip HTML tags
        import re
        clean_text = re.sub(r'<[^>]+>', '', content)
        
        # Truncate to 150 characters
        if len(clean_text) > 150:
            return clean_text[:150].strip() + '...'
        return clean_text.strip()

    def get_url(self, obj):
        """Generate full URL to the news article"""
        slug = obj.get('slug', '')
        return f"https://dairynews7x7.com/news/{slug}"


class FullNewsSerializer(serializers.Serializer):
    """
    Full news serializer for the detail view.
    """
    id = serializers.IntegerField()
    title = serializers.CharField()
    content = serializers.SerializerMethodField()
    image = serializers.CharField(source='featured_media_url', allow_null=True)
    url = serializers.SerializerMethodField()
    published_at = serializers.DateTimeField(source='date')
    categories = serializers.ListField(child=serializers.CharField())

    def get_content(self, obj):
        content = obj.get('content', '')
        if isinstance(content, dict):
            return content.get('rendered', '')
        return content

    def get_url(self, obj):
        """Generate full URL to the news article"""
        slug = obj.get('slug', '')
        return f"https://dairynews7x7.com/news/{slug}"

