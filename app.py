import webapp2
import jinja2
import os
import urllib2
import json

BASE_API_URL = "https://api.github.com/repos/{owner}/{repo}"
CLIENT_ID = "97bda44d2a591d45b0da"
CLIENT_SECRET = "f734d02a05aad1d19e9271bca3b1d3b85be518c0"
AUTH_ARGS = "client_id={CLIENT_ID}&client_secret={CLIENT_SECRET}".format(CLIENT_ID=CLIENT_ID, CLIENT_SECRET=CLIENT_SECRET)
PAGE_SIZE = 30

class GraphPage(webapp2.RequestHandler):
  def get(self):
    max_commits = self.request.get("max_commits")
    repo = self.request.get("repo")
    owner = self.request.get("owner")
    try:
      max_commits = int(max_commits)
    except ValueError:
      self.response.write("max commits must be a valid base 10 number")
      return
    if max_commits > 1000:
      self.response.write("max commits must be <= 1000")
      return
    try:
      commits = getCommits(repo, owner, max_commits)
      template = JINJA_ENVIRONMENT.get_template("templates/graph.html")
      template_vars = {"commits": json.dumps(commits[:max_commits])}
      self.response.write(template.render(template_vars))
    except:
      self.response.write("Invalid repository")


def getCommits(repo, owner, max_commits):
  page = 1
  commits = []
  while len(commits) < max_commits:
    url = BASE_API_URL.format(repo=repo, owner=owner) + "/commits?since=2007-01-01T01:01:00Z&page={page}&{AUTH_ARGS}".format(page=page, AUTH_ARGS=AUTH_ARGS);
    response = urllib2.urlopen(url)
    new_commits = json.loads(response.read())
    commits.extend(new_commits)
    if len(new_commits) < PAGE_SIZE:
      break
    page += 1
  return commits


class MainPage(webapp2.RequestHandler):
  def get(self):
    template = JINJA_ENVIRONMENT.get_template("templates/landing.html")
    template_vars = {}
    self.response.write(template.render(template_vars))


JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=False)

app = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/graph', GraphPage),
], debug=True)