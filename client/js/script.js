const margin = {
  top: 90,
  right: 20,
  bottom: 50,
  left: 100
}

let width = 800 - margin.left - margin.right;
let height = 600 - margin.top - margin.bottom;
                
d3.csv("data/ANZ-jan-may-19.csv").then((data) => {
  console.log(data)

  // filter out credits
  let filteredData = data.filter(d => {
    return +d.amount < 0
  })

  // make the negatives positive
  filteredData.forEach(d => {
    d.amount = +d.amount * -1
  })

  // nest data by date
  let nestedData = d3.nest()
    .key(d => {
      return d.date
    }).entries(filteredData)

  let totalSpendData = []

  nestedData.map(d => {
    let total = 0
    d.values.forEach(transaction => total = total + transaction.amount)
    totalSpendData.push({"date": d.key, "amount": total.toFixed(2)})
  })
  console.log("spend data", totalSpendData)

  let colourScale = d3.scaleOrdinal()
    .domain(nestedData.map(function(d) {
      return d.key;
    }))
    .range(['#e5446d', '#BC8F8F', '#ffba49', '#20a39e', '#DC143C', '#663399', '#f2e3bc', '#ff8552', '#f76f8e', '#14cc60', '#931621', '#87CEEB', '#C0C0C0', '#d1f5ff', '#7d53de'])

  let svg = d3.select("#total-spend")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)

  let g = svg.append("g")
              .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")

  let minDate = new Date("3/1/2019")
  let maxDate = new Date("31/5/2019")
  let x = d3.scaleLinear()
            .range([0, width])
            .domain([minDate, maxDate])

  let y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, 5000])

  let xAxisCall = d3.axisBottom()
                    .ticks(totalSpendData.length)

  let yAxisCall = d3.axisLeft()
                    .ticks(10)
                    .tickFormat(d => {
                      return `$${+d}`
                    })

  let line = d3.line()
                .x(d => {
                  return x(d.date)
                })
                .y(d => {
                  return y(+d.amount)
                })

  let xAxis = g.append('g')
              .attr('class', 'x axis')
              .attr('transform', 'translate(0,' + height + ')')
              .call(xAxisCall.scale(x))

  let yAxis = g.append('g')
                  .attr('class', 'y axis')
                  .call(yAxisCall.scale(y))

  yAxis.append("text")
        .attr('class', 'axis-title')
        .attr('transform', 'rotate(-90)')
        .attr('y', -70)
        .attr('x', -(height / 2))
        .attr('font-size', '18px')
        .attr('fill', 'black')
        .attr('font-family', 'Raleway')
        .style('text-anchor', 'middle')
        .text('$ spend')

  xAxis.append("text")
        .attr('class', 'axis-label')
        .attr('x', width / 2)
        .attr('y', height + 50)
        .attr('fill', 'black')
        .attr('font-family', 'Raleway')
        .attr('font-size', '18px')
        .attr('text-anchor', 'middle')
        .text('date')

  let lines = g.selectAll(".line")
                .data(totalSpendData)
                .enter()
                .append("path")
                .attr("class", "line")
                .attr("stroke", d => {
                  return colourScale(d)
                })
                .attr("d", d => {
                  return line(+d.amount)
                })
})
