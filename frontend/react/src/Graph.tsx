// tslint:disable:no-console
import cytoscape from "cytoscape";
import cola from 'cytoscape-cola';
import React, { Component } from "react";

import "./Graph.css";

cytoscape.use(cola);

const style: cytoscape.CssStyleDeclaration = [
  {
    selector: "node",
    style: {
      "border-opacity": 1,
      "border-width": 1,
      content: function content(ele: any) {
        return ele.data("label") || ele.data("id");
      },
      label: "data(label)",
      "overlay-opacity": 0,
      "overlay-padding": "5px",
      padding: 5,
      "text-halign": "center",
      "text-valign": "center",
      width: "label",
      "z-index": 10
    }
  },
  {
    selector: "$node > node",
    style: {
      "background-color": "#bbb",
      "padding-bottom": "10px",
      "padding-left": "10px",
      "padding-right": "10px",
      "padding-top": "10px",
      "text-halign": "center",
      "text-valign": "top"
    }
  },
  {
    selector: "edge",
    style: {
      "curve-style": "haystack",
      "font-family": "FreeSet,Arial,sans-serif",
      "font-size": 9,
      "font-weight": "bold",
      label: "data(label)", // maps to data.label
      opacity: 0.9,
      "overlay-opacity": 0,
      "overlay-padding": "3px",
      "text-background-color": "#ffffff",
      "text-background-opacity": 1,
      "text-background-padding": 3,
      "text-background-shape": "roundrectangle",
      width: 1
    }
  },
  {
    selector: ":selected",
    style: {
      "background-color": "black",
      "line-color": "black",
      "source-arrow-color": "black",
      "target-arrow-color": "black"
    }
  }
];

const layout = { name: "cola" };

const elements = {
  edges: [
    {
      data: {
        id: "ad",
        label: "don't do this",
        source: "inbox",
        target: "task1"
      }
    },
    { data: { id: "eb", label: "monday", source: "next", target: "task2" } }
  ],
  nodes: [
    { data: { id: "inbox", label: "INBOX" }, position: { x: 215, y: 85 } },
    { data: { id: "today", label: "TODAY" } },
    { data: { id: "next", label: "NEXT" }, position: { x: 300, y: 85 } },
    {
      data: { id: "task1", label: "Our first task" },
      position: { x: 215, y: 175 }
    },
    { data: { id: "task2", label: "Our second task" } },
    {
      data: { id: "task3", label: "A third task" },
      position: { x: 300, y: 175 }
    }
  ]
};

class Graph extends Component<any> {
  private cy: any;
  private cyRef: any;
  private createdNode: any;
  private nearestNode: any;

  public componentDidMount() {
    const cy = cytoscape({
      autounselectify: true,
      boxSelectionEnabled: false,
      container: this.cyRef,
      elements,
      layout,
      style
    });

    this.cy = cy;
    cy.on("tap", (evt: any) => {
      this.handleTap(evt);
    });
    cy.on("grabon", (evt: any) => {
      this.handleDrag(evt);
    });
    cy.on("free", (evt: any) => {
      this.handleDrag(evt);
    });
  }

  public componentWillUnmount() {
    if (this.cy) {
      this.cy.destroy();
    }
  }

  public shouldComponentUpdate(nextProps: any, nextState: any) {
    console.log(nextProps, this.createdNode);
    const cy = this.cy;
    const id = Math.round(Math.random() * 100000);
    const position = this.createdNode.position;
    const newNode = {
      data: {
        id,
        label: nextProps.inputValue
      },
      group: "nodes",
      position
    };
    cy.add(newNode);
    cy.remove(cy.$id(this.createdNode.data.id));

    this.createdNode = newNode;

    return false;
  }

  public render() {
    return (
      <div>
        <div
          className="graph"
            ref={(cy: any) => {
            this.cyRef = cy;
          }}
          style={{
            display: "block",
            height: "100%",
            width: "100%"
          }}
        />
      </div>
    );
  }

  private handleTap = (event: any): void => {
    console.log("handleTap", event.type);
    const cy = this.cy;
    const { target } = event;
    const id = Math.round(Math.random() * 100000);
    if (target === cy) {
      const newNode = {
        data: {
          id,
          label: "New task"
        },
        group: "nodes",
        position: event.position
      };
      cy.add(newNode);
      this.createdNode = newNode;
    } else if (target.isEdge()) {
      cy.remove(target);
    } else if (target.isNode()) {
      this.createdNode = target;
    }
  };

  private handleDrag = (event: any) => {
    console.log("handleGrab", event.type, this.nearestNode);
    const { target, type } = event;
    const cy = this.cy;

    if (type === "free") {
      cy.removeListener("tapdrag");
      target.style({ "background-color": "gray" });
      if (this.nearestNode) {
        this.nearestNode.style({ "background-color": "gray" });
      }

      return;
    }

    target.style({ "background-color": "cornflowerblue" });
    let handled = false;
    const nodes = cy.nodes();

    const nearestNodeFrom = (p: any, max = 20) => {
      nodes.forEach((n: any) => {
        const p1 = n.position();
        const distance = Math.sqrt(
          Math.pow(p1.x - p.x, 2) + Math.pow(p1.y - p.y, 2)
        );
        n.data("distance", distance); // TODO: n.scratch
      });

      const { ele } = nodes
        .filter((n: any) => n.id() !== target.id())
        .filter(`[distance < '${max}']`)
        .min((n: any) => n.data("distance"));

      return ele;
    };

    cy.on("tapdrag", (evt: any) => {
      const tryNearestNode = nearestNodeFrom(evt.position);
      if (!tryNearestNode || handled) {
        return;
      }

      this.nearestNode = nearestNodeFrom(evt.position);
      this.nearestNode.style({ "background-color": "cornflowerblue" });
      handled = true;

      const s = target.id();
      const t = this.nearestNode.id();
      const id = `${s}${t}`;
      const edges = this.nearestNode.edgesWith(target);

      if (edges.length) {
        cy.remove(edges.shift());
      } else {
        cy.add({
          data: { id, source: s, target: t },
          group: "edges"
        });
      }
    });
  };
}

export default Graph;
