import webapp2
import jinja2
import os

class GraphPage(webapp2.RequestHandler):
  def get(self):
    template = JINJA_ENVIRONMENT.get_template("templates/main.html")
    template_vars = {"repo": self.request.get("repo"), "owner": self.request.get("owner")}
    self.response.write(template.render(template_vars))

class MainPage(webapp2.RequestHandler):
  def get(self):
    self.response.write('''
      <html>
      <body>
      <form action="/graph">
        <input type="text" name="repo" placeholder=repo name></input>
        <input type="text" name="owner" placeholder=owner></input>
        <button value="submit">Get Graph</button>
      </form>
      </body>
      </html>
      ''')

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

app = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/graph', GraphPage),
], debug=True)