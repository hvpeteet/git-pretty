// TODO(hvpeteet): 
//   1) Multiple roots(too big to get real root), 
//   2) time window select, 
//   3) show commit message, 
//   4) show useful info, 
//   5) select 2 and diff


function createCommitTree(repo, owner) {
  $.get("https://api.github.com/repos/" + owner + "/" + repo + "/commits?since=1995-01-01T01:01:00Z").done(processCommits);
}

// Takes a list of commits and returns a head node.
function processCommits(commits) {
  // Create map[sha1]node
  var sha_to_node = {};
  for (i in commits) {
    sha_to_node[commits[i].sha] = newNode(commits[i]);
  }
  // Create tree of nodes
  var heads = [];
  for (i in sha_to_node) {
    var parents = sha_to_node[i].commit.parents;
    if (parents.length > 0) {
      for (j in parents) {
        if (sha_to_node[parents[j].sha]) {
          sha_to_node[parents[j].sha].children.push(sha_to_node[i]);
        } else {
          heads.push(sha_to_node[i]);
        }
      }
    } else {
      heads.push(sha_to_node[i]);
    }
  }
  for (i in heads) {
    computeLevels(heads[i], 1);
  }
  for (i in heads) {
    computeLevels(heads[i], 1);
  }
  renderNodes(heads, sha_to_node);
}

function computeLevels(node, start) {
  node.level = start;
  for (i in node.children) {
    if (node.children[i].level < start + 1) {
      computeLevels(node.children[i], start + 1);
    }
  }
}

function renderNodes(heads, sha_to_node) {
  var nodes_list = [];
  var edges_list = [];
  for (i in sha_to_node) {
    var node_color = getRandomColor();
    nodes_list.push({id: i, label: i.slice(0,7), level: sha_to_node[i].level, color: {border: node_color,  highlight: node_color, background: node_color}});
    for (j in sha_to_node[i].children) {
      edges_list.push({from: i, to: sha_to_node[i].children[j].commit.sha, color: {color: node_color, highlight: node_color}});
    }
  }
  var nodes = new vis.DataSet(nodes_list);
  var edges = new vis.DataSet(edges_list);
  var container = document.getElementById("graph");
  var data = {
    nodes: nodes,
    edges: edges
  };
  var options = {
    layout: {hierarchical: {
      enabled: true,
      levelSeparation: 100,
      sortMethod: "directed"
    }},
    autoResize: true,
    edges: {
      smooth: true
    },
    physics:{
      hierarchicalRepulsion: {centralGravity: -1, springConstant: 1.0}
    }
  };
  var network = new vis.Network(container, data, options);
  network.on("click", function(data){
    if (data.nodes.length == 0) {
      return;
    }
    var node = sha_to_node[data.nodes[0]];
    var inspector = document.getElementById("inspector");
    inspector.innerHTML = node.commit.commit.message;
  });
}

// Constructs a new node.
// Args:
//   children: an array of sha1 hashes (strings) that are the hashes of the child nodes.
function newNode(commit) {
  return {
    "children": [], 
    "commit": commit,
    "level": 0
  };
}

function getRandomColor() {
  var letters = '456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}