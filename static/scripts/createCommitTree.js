// TODO(hvpeteet): 
//   1) Multiple roots(too big to get real root), [DONE]
//   2) time window select, 
//   3) show commit message, [DONE]
//   4) show useful info, 
//   5) select 2 and diff

var sha_to_node = {};

// Will process and then render the nodes held.
// Assumes / inputs:
//   This uses a gloabl list named commits that should have all commit objects contained in it.
function processCommits() {
  for (i in commits) {
    sha_to_node[commits[i].sha] = newNode(commits[i]);
  }
  var heads = []; // Since we do not get the entire git history there may be multiple heads of this tree.
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
  console.log(heads);
  renderNodes(heads);
}

// Will refresh the level field in a node and all of its child nodes to be equal to their depth in the tree.
// Start is the level that the current node is at.
function computeLevels(node, start) {
  node.level = start;
  for (i in node.children) {
    if (node.children[i].level < start + 1) {
      computeLevels(node.children[i], start + 1);
    }
  }
}

// Takes a list of head nodes and renders them as well as their children.
function renderNodes(heads) {
  console.log("rendering nodes");
  var nodes_list = [];
  var edges_list = [];
  for (i in sha_to_node) {
    var node_color = getRandomColor();
    nodes_list.push({id: i, label: i.slice(0,7), level: sha_to_node[i].level, color: {border: node_color,  highlight: node_color, background: node_color, value: 1}});
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
      levelSeparation: 80,
      sortMethod: "directed"
    }},
    autoResize: true,
    edges: {
      smooth: false
    },
    physics:{
      hierarchicalRepulsion: {centralGravity: -1, springConstant: 1.0, damping: 1, nodeDistance: 120}
    },
    nodes: {
      shape: "circle"
    }
  };
  console.log(nodes_list);
  console.log("handed rendering off to api");
  var network = new vis.Network(container, data, options);
  network.on("click", networkOnclick);
}

function networkOnclick(click_event) {
    if (click_event.nodes.length == 0) {
      return;
    }
    var node = sha_to_node[click_event.nodes[0]];
    console.log(node);
    document.getElementById("commit_message").innerHTML = node.commit.commit.message;
    document.getElementById("committer").innerHTML = node.commit.commit.committer.name;
    document.getElementById("commit_sha").innerHTML = node.commit.sha;
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


// ===========================================
// EXPERIMENTAL BELOW HERE
// ===========================================

// function getFullDiff(node_sha, other_sha, callback) {
//   // TODO(hvpeteet)
//   callback(null);
// }

// function getDiffNum(node_sha, other_sha, callback) {
//   var url = baseURL + "/compare/" + other_sha + "..." + node_sha + "?" + auth_args;
//   $.get(url).done(function(resp) {
//     console.log(resp.commits.files);
//     var diff = 0;
//     for (i in resp.commits.files) {
//       diff += resp.files[i].additions + resp.files[i].deletions;
//     }
//     callabck(diff);
//   });
// }