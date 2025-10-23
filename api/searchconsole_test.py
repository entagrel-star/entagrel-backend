import flask
import google.oauth2.credentials
import googleapiclient.discovery
from flask import Flask, session, redirect

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Replace with a secure key

SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']
API_SERVICE_NAME = 'searchconsole'
API_VERSION = 'v1'

# Helper function to convert credentials to dict

def credentials_to_dict(credentials):
    return {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes
    }

@app.route('/test')
def test_api_request():
    if 'credentials' not in session:
        return redirect('authorize')

    credentials = google.oauth2.credentials.Credentials(
        **session['credentials'])

    search_console_service = googleapiclient.discovery.build(
        API_SERVICE_NAME, API_VERSION, credentials=credentials)
    site_list = search_console_service.sites().list().execute()

    verified_sites_urls = [s['siteUrl'] for s in site_list['siteEntry']
                          if s['permissionLevel'] != 'siteUnverifiedUser'
                          and s['siteUrl'].startswith('http')]

    results = '<!DOCTYPE html><html><body><table><tr><th>Verified site</th><th>Sitemaps</th></tr>'
    for site_url in verified_sites_urls:
        sitemaps = search_console_service.sitemaps().list(siteUrl=site_url).execute()
        results += '<tr><td>%s</td>' % (site_url)
        if 'sitemap' in sitemaps:
            sitemap_list = "<br />".join([s['path'] for s in sitemaps['sitemap']])
        else:
            sitemap_list = "<i>None</i>"
        results += '<td>%s</td></tr>' % (sitemap_list)
    results += '</table></body></html>'

    session['credentials'] = credentials_to_dict(credentials)
    return results

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)
