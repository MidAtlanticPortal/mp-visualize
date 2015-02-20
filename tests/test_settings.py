# Minimal settings file required to run tests.

SECRET_KEY = 'poodles-puddles'

INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',

    'tests',
    'visualize',
]

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
)

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.spatialite',
        'NAME': 'some.db',
    }
}

SPATIALITE_LIBRARY_PATH = '/Users/seth/root/brew/lib/mod_spatialite.dylib'

ROOT_URLCONF = 'tests.urls'

GEOMETRY_CLIENT_SRID = 3857
GEOMETRY_DB_SRID = 3857