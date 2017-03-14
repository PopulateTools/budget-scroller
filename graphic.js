/* 
	I've created a function here that is a simple d3 chart.
	This could be anthing that has discrete steps, as simple as changing
	the background color, or playing/pausing a video.
	The important part is that it exposes and update function that
	calls a new thing on a scroll trigger.
*/
window.createGraphic = function(graphicSelector, budget) {
	var graphicEl = d3.select('.graphic');
	var graphicVisEl = graphicEl.select('.vis');
	var graphicProseEl = graphicEl.select('.text');
	
	var SPAIN;
	var VLC;
	var DENIA;
	var budgetData = budget;
	
	var scaleX = null;
	
	var margin = {top: 20, right: 30, bottom: 20, left: 10};
	    width = graphicVisEl.node().clientWidth - margin.left - margin.right,
	    height = 320 - margin.top - margin.bottom;

	// actions to take on each step of our scroll-driven story
	var steps = [
		function step0() {
			var t = d3.transition()
				.duration(400);

			var item = graphicVisEl.selectAll('.item')
				.data(SPAIN)
				.transition(t)
				.attr('fill', function(d) {
					return color(d.place_name);
				})
				.attr('transform', function(d, i) {
					return translate(scaleX(d.pct_budget), 30 * i)
				});
				
			item.select('text')
				.text(function(d) { return d.budget_line_1_name });
		},

		function step1() {
			var t = d3.transition()
				.duration(400);

			var item = graphicVisEl.selectAll('.item')
				.data(VLC);
				
			item.transition(t)
				.attr('fill', function(d) {
					return color(d.place_name);
				})
				.attr('transform', function(d, i) {
					return translate(scaleX(d.pct_budget), 30 * i)
				});

			item.select('text')
				.text(function(d) { return d.budget_line_1_name });
		},
		function step2() {
			var t = d3.transition()
				.duration(600);
				
			var item = graphicVisEl.selectAll('.item')
				.data(DENIA)
			
			item.exit()
				.attr('transform', function(d) {
					return translate(-999, -999);
				});
			
			item.transition(t)
				.attr('fill', function(d) {
					return color(d.place_name);
				})
				.attr('transform', function(d, i) {
					return translate(scaleX(d.pct_budget), 30 * i)
				});
			
			item.select('text')
				.text(function(d) { return d.budget_line_1_name });
		},
	]

	// update our chart
	function update(step) {
		steps[step].call();
	}
	
	// little helper for string concat if using es5
	function translate(x, y) {
		return 'translate(' + x + ',' + y + ')';
	}
	
	function setupData() {
		budgetData.forEach(function(d) {
			d.pct_budget = +d.pct_budget
			d.total_amount = +d.total_amount
			d.total_budget = +d.total_budget
		});
		
		budgetData.sort(function(a, b) {return a.pct_budget - b.pct_budget });
		
		SPAIN = budgetData.filter(function(d) { return d.place_name === 'Spain' });
		VLC = budgetData.filter(function(d) { return d.place_name === 'Comunitat Valenciana' });
		DENIA = budgetData.filter(function(d) { return d.place_name === 'Dénia' });
	}

	function setupCharts() {
		var svg = graphicVisEl.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
		
		var chart = svg.append('g')
			.classed('chart', true)
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

		scaleX = d3.scaleLinear();
		scaleY = d3.scaleOrdinal();
		color = d3.scaleOrdinal()
			.domain('Spain', 'Comunitat Valenciana', 'Dénia')
			.range(['darkred', 'darkorange', 'steelblue']);
		
		scaleX
			.domain([0, 100])
			.range([0, width]);
		
		scaleY
			.domain(DENIA.length)
			.range([0, 200])
			
		var xAxis = d3.axisBottom()
			.ticks(5)
			.tickSize(-height)
			.scale(scaleX);
	
		chart.append('g')
    	.attr('class', 'x axis')
    	.attr('transform', 'translate(10,' + (height - 20) + ')')
    	.call(xAxis)
			
		var item = chart.selectAll('.item')
			.data(SPAIN)
			.enter().append('g')
			.classed('item', true)
			.attr('fill', function(d) {
				return color(d.place_name);
			})
			.attr('transform', function(d, i) {
				return translate(scaleX(d.pct_budget), 30 * i)
			});
		
		item.append('circle')
			.attr('r', 10);

		item.append('text')
			.text(function(d) { return d.budget_line_1_name })
			.attr('y', 1)
			.attr('dx', 15);
	}

	function setupProse() {
		var height = window.innerHeight * 1;

		graphicProseEl.selectAll('.trigger')
			.style('height', height + 'px');
	}

	function init() {
		setupData();
		setupCharts();
		setupProse();
		update(0);
	}
	
	init();
	
	return {
		update: _.debounce(update, 300),
	}
}