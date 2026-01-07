class NewsRouter:
    """
    Router for the `news` app.
    - READ ONLY database: news_db
    - No writes
    - No migrations
    """

    def db_for_read(self, model, **hints):
        """
        Read news models from news_db.
        """
        if model._meta.app_label == 'news':
            return 'news_db'
        return None

    def db_for_write(self, model, **hints):
        """
        Prevent writes to news_db.
        """
        if model._meta.app_label == 'news':
            return None  # Block writes
        return None

    def allow_relation(self, obj1, obj2, **hints):
        """
        Disallow relations involving news models.
        """
        if obj1._meta.app_label == 'news' or obj2._meta.app_label == 'news':
            return False
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Prevent all migrations for news app on any database.
        """
        if app_label == 'news':
            return False
        return None
