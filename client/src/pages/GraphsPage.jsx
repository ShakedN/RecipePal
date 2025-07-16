import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import * as d3 from "d3";
import "./GraphsPage.css";

const GraphsPage = () => {
  const location = useLocation();

  useEffect(() => {
    const userId = localStorage.getItem("userId"); //Get userID from local storage

    //Fetch posts per day
    fetch(`http://localhost:5000/api/graphs/posts-per-day/${userId}`)
      .then((res) => res.json())
      .then((data) => drawBarChart(data));

    //Fetch top liked posts
    fetch(`http://localhost:5000/api/graphs/top-liked-posts/${userId}`)
      .then((res) => res.json())
      .then((data) => drawTopBarChart(data));
  }, [location]);

  //Draw a bar chart showing the number of posts per day over the last 7 days using D3.js
  const drawBarChart = (data) => {
    //Generate an array of the last 7 days
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return d;
    });

    //Map server data by date
    const dataMap = new Map(
      data.map((item) => {
        const date = new Date(item._id.year, item._id.month - 1, item._id.day);
        return [date.toDateString(), item.count];
      })
    );

    //Put 0 values for days with no posts
    const chartData = last7Days.map((date) => ({
      date,
      count: dataMap.get(date.toDateString()) || 0,
    }));

    //Set chart dimensions and margins
    const margin = { top: 30, right: 30, bottom: 50, left: 50 },
      width = 600 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

    d3.select("#chart1").selectAll("*").remove(); //Clear previous chart

    //Create an SVG container
    const svg = d3
      .select("#chart1") //Select the div with id 'chart1'
      .append("svg")
      .attr("width", width + margin.left + margin.right) //Set full width
      .attr("height", height + margin.top + margin.bottom) //Set full height
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    //Create the X scale
    const x = d3
      .scaleBand()
      .domain(chartData.map((d) => d3.timeFormat("%b %d")(d.date))) //Set X domain
      .range([0, width])
      .padding(0.1);

    //Create the Y scale
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, (d) => d.count)]) //Set Y domain from 0 to max count
      .nice() //End on round numbers
      .range([height, 0]);

    //Draw the X-axis at the bottom
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "10px");

    //Draw the Y-axis with whole number ticks
    svg.append("g").call(
      d3
        .axisLeft(y)
        .ticks(d3.max(chartData, (d) => d.count))
        .tickFormat(d3.format("d"))
    );

    //Draw the bars for each day
    svg
      .selectAll("bars")
      .data(chartData)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d3.timeFormat("%b %d")(d.date)))
      .attr("y", (d) => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.count))
      .attr("fill", "#69b3a2");
  };

  //Draw a bar chart showing the top 5 posts of the user
  const drawTopBarChart = (data) => {
    //Set chart dimensions and margins
    const margin = { top: 30, right: 30, bottom: 50, left: 50 },
      width = 600 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

    d3.select("#chart2").selectAll("*").remove(); //Clean the last graph

    //Create new SVG element and group element (g) for drawing
    const svg = d3
      .select("#chart2") //Select the div with id 'chart2'
      .append("svg")
      .attr("width", width + margin.left + margin.right) //Set full width
      .attr("height", height + margin.top + margin.bottom) //Set full height
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    //Create the X scale
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.title))
      .range([0, width])
      .padding(0.2);

    //Create the Y scale
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.likeCount)])
      .range([height, 0]);

    //Draw the X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-30)")
      .style("text-anchor", "end");

    //Draw the Y-axis with whole number ticks
    svg.append("g").call(
      d3
        .axisLeft(y)
        .ticks(Math.ceil(d3.max(data, (d) => d.likeCount))) //Integer number of ticks
        .tickFormat(d3.format("d")) //Shoe only integers
    );

    //Draw the bars for each post
    svg
      .selectAll("bars")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.title))
      .attr("y", (d) => y(d.likeCount))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.likeCount))
      .attr("fill", "#4287f5");
  };

  return (
    <div className="graphs-page">
      <h2>Posts Per Day (Last 7 Days)</h2>
      <div id="chart1" className="chart-container"></div>

      <h2>Top 5 Liked Posts</h2>
      <div id="chart2" className="chart-container"></div>
    </div>
  );
};

export default GraphsPage;
