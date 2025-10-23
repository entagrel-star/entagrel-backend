# Code Citations

## License: MIT
https://github.com/mrfishball/imbusy/tree/38d226151dbc46174a242a20ea316dec0a7f3921/connect.py

```
@app.route('/test')
def test_api_request():
    if 'credentials' not in flask.session:
        return flask.redirect('authorize')

    # Load credentials from the session.
    credentials = google.oauth2.credentials.Credentials(
        **flask.
```


## License: unknown
https://github.com/Kevin-Ellen/python3-oauth2-gsc/tree/21a63cd29e3437a0c14fbc9ea059de4d0dacd8e1/main.py

```
credentials = google.oauth2.credentials.Credentials(
        **flask.session['credentials'])

    # Retrieve list of properties in account
    search_console_service = googleapiclient.discovery.build(
        API_SERVICE_NAME, API_VERSION, credentials=credentials)
    site_list = search_console_service.sites().list()
```


## License: unknown
https://github.com/Prilom/APIgoogleSearchConsole/tree/148457443b79076e1e409e003f5a1b7958d2d37b/main.py

```
().execute()

    # Filter for verified URL-prefix websites.
    verified_sites_urls = [s['siteUrl'] for s in site_list['siteEntry']
                          if s['permissionLevel'] != 'siteUnverifiedUser'
                          and s['siteUrl'].startswith(
```


## License: GPL_3_0
https://github.com/wacapp/performance-analyzer/tree/ba2558379b0b5a555b822a5e3aefb27b05fb1f91/antiques/query.py

```
sitemaps:
            sitemap_list = "<br />".join([s['path'] for s in sitemaps['sitemap']])
        else:
            sitemap_list = "<i>None</i>"
        results += '<td>%s<
```

