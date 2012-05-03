$(function() {
    function drawone(number) {
    var correct = [0, 2, 4, 0, 2, 1, 3, 0, 4, 1];
    var x = d3.scale.ordinal().range([10,120,230,340,450]),
    y = d3.scale.linear().range([10, 100]).clamp(true),
    ew = d3.scale.linear().range([10,100]).clamp(true),
    z = d3.scale.ordinal().range(["rgb(26,150,65)", "rgb(166,217,106)", "rgb(253,174,97)","rgb(215,25,28)"]),
    w = 560;
    h = 160;
    var svg = d3.select("div.questions").append("div").attr("class","well span7 num"+number).style("position","relative")
    .html("<p>Question "+number+":</p><button class='btn' type='submit' data-toggle='button'><img src='flag.png' width=50 height=50></button>")
    .append("svg:svg")
    .attr("width", w)
    .attr("height", h)
    .attr("id",number)
	.append("svg:g");
	


	var clippath = d3.select("g")
		.append("svg:clipPath")
		.attr("id","cp"+number);

	d3.csv("data"+number+".csv", function(question) {

		// Transpose the data into layers by cause.
		var quest = d3.layout.stack()(["q1", "q2", "q3","q4"].map(function(quartile) {
			return question.map(function(d,i) {
				return {x: i, y: +d[quartile], sum:(+d["q1"])+(+d["q2"])+(+d["q3"])+(+d["q4"]), all: [+d["q1"],+d["q2"],+d["q3"],+d["q4"]]};
			});
		}));
		var sums = [];
		var j;
		for (j = 0; j<quest[0].length; j++) {
			sums[j] = [quest[0][j].sum, quest[0][j].x];
		}
		function sortNumber(a,b)
		{
			return b[0] - a[0];
		}
		sums.sort(sortNumber);
		Array.prototype.indexOf0 = function(a){for(i=0;i<this.length;i++)if(a==this[i][1])return i;return null;};

		

		// Compute the x-domain (by date) and y-domain (by top).
		x.domain(quest[0].map(function(d) { return d.x; }));
		y.domain([0, d3.max(quest[quest.length - 1], function(d) { return d.y0 + d.y; })]);
		ew.domain([0,d3.max(quest[0], function(d) { return d.sum; })]);

		/*var circles = clippath.selectAll("circle")
			.data(quest[0])
			.enter()
			.append("svg:circle")
			.attr('id', number)
			.attr('cx', function(d,i) { return (100-ew(d.sum))/2+x(d.x)+ew(d.sum/2); })
			.attr('cy',function(d,i) { return (100-ew(d.sum))/2+ew(d.sum/2); })
			.attr('r', function(d,i) { return ew(d.sum/2); });*/

	var text = svg.selectAll("text")
			.data(quest[0])
			.enter()
			.append("svg:text")
			.attr('x', function(d,i) { return (100-ew(d.sum))/2+x(d.x)+ew(d.sum/2); })
			.attr('y', 155)
			.text(function (d) { return ["A","B","C","D","E"][d.x];})
			.attr("text-anchor","middle")
			.style("font-size", "2em")
			.attr("class", number);

	var answer = svg.selectAll("rect")
			.data(quest[0])
			.enter()
			.append("svg:rect")
			.attr('x', function (d,i) { return (100-ew(d.sum))/2+x(d.x)-5;})
			.attr('y', function (d,i) {return (100-ew(d.sum))/2+y(d.y0)-5+10;})
			.attr('width', function(d,i) { if (correct[number] != d.x) return 0; return ew(d.sum)+10; })
			.attr('height', function(d,i) { if (correct[number] != d.x) return 0; return ew(d.sum)+10; })
			.attr('rx',20)
			.attr('ry',20)
			.style('stroke', 'black')
			.style('stroke-width', '5px')
			.style('fill', 'none')
			.attr('class','ans');

	var circles = clippath.selectAll("circle")
			.data(quest[0])
			.enter()
			.append("svg:rect")
			.attr('id', number)
			.attr('x', function(d,i) { return (100-ew(d.sum))/2+x(d.x); })
			.attr('y',function(d,i) { return (100-ew(d.sum))/2+y(d.y0)+10; })
			.attr('width', function(d,i) { return ew(d.sum); })
			.attr('height', function(d,i) { return ew(d.sum); })
			.attr('rx',20)
			.attr('ry',20);



		// Add a group for each cause.
		var cause = svg.selectAll("g.quartile")
			.data(quest)
			.enter().append("svg:g")
			.attr("clip-path", "url(#cp"+number+")")
			.attr("class", "quart")
			.style("fill", function(d, i) { return z(i); });

		// Add a rect for each date.
		var rect = cause.selectAll("rect")
			.data(Object)
			.enter().append("svg:rect")
			.attr("x", function(d,i) { return (100-ew(d.sum))/2+x(d.x); })
			.attr("y", function(d) { return (100-ew(d.sum))/2+y(d.y0)+10; })
			.attr("height", function(d) { return ew(d.y); })
			.attr("width", function (d) {return ew(d.sum);})
			.attr("class", "rect")
			.attr("title", function (d) { return x(d.y) + " students";});
			

		var div = d3.selectAll("div.num"+number)
			.on("mouseover", function () {
				cause.selectAll("rect")
				.transition()
				.duration(500)
				.attr("x", function (d,i) { return (100-ew(d.sum))/2+x(sums.indexOf0(d.x)); });

				clippath.selectAll("rect")
				.transition()
				.duration(500)
				.attr('x', function(d,i) { return (100-ew(d.sum))/2+x(sums.indexOf0(d.x)); });

				svg.selectAll("text")
				.transition()
				.duration(500)
				.attr("x", function (d,i) { return (100-ew(d.sum))/2+x(sums.indexOf0(d.x))+ew(d.sum/2); });

				svg.selectAll("rect.ans")
				.transition()
				.duration(500)
				.attr('x', function (d,i) { return (100-ew(d.sum))/2+x(sums.indexOf0(d.x))-5;});

		})
		.on("mouseout", function () {
			cause.selectAll("rect")
			.transition()
			.duration(500)
			.attr("x", function (d,i) { return (100-ew(d.sum))/2+x(d.x); });

			clippath.selectAll("rect")
			.transition()
			.duration(500)
			.attr('x', function(d,i) { return (100-ew(d.sum))/2+x(d.x); });

			svg.selectAll("text")
			.transition()
			.duration(500)
			.attr('x', function(d,i) { return (100-ew(d.sum))/2+x(d.x)+ew(d.sum/2); });

			svg.selectAll("rect.ans")
			.transition()
			.duration(500)
			.attr('x', function (d,i) { return (100-ew(d.sum))/2+x(d.x)-5;});
		});

	});
}
for (var i=1; i<=9; i++) {
	drawone(i);
}
 });