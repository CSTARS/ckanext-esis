ckanext-esis
============

EcoSIS extension for CKAN adding resource controls for spectra


## CKAN 'IDE'

## Allow local cross-site auth (dev only)
in ckan/lib/base.py
```
     def _set_cors(self):
-        response.headers['Access-Control-Allow-Origin'] = "*"
+        #response.headers['Access-Control-Allow-Origin'] = "*"
+        if 'Origin' in request.headers:
+            response.headers['Access-Control-Allow-Origin'] = request.headers['Origin']
+        else:
+            response.headers['Access-Control-Allow-Origin'] = "*"
+
         response.headers['Access-Control-Allow-Methods'] = \
             "POST, PUT, GET, DELETE, OPTIONS"
         response.headers['Access-Control-Allow-Headers'] = \
             "X-CKAN-API-KEY, Authorization, Content-Type"
 
+        response.headers['Access-Control-Allow-Credentials'] = "true"

```
