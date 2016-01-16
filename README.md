Simple tool to project during a mapathon and show progress towards a goal.

### manual option

- you can use the page in 'manual' folder has small inputs for progress and goal in the corner that can be used to change the displayed percentage complete
- on a separate computer watch your desired metric using the tool of your choice and update as needed

### automated option (buildings)

- copy the 'demo' folder
- at the top of `js/main.js` update the coordinates for your AOI
- update the goal
- right before your event run an [overpass](http://overpass-turbo.eu/) query:

  ````way[building]({{lat-min}}, {{lng-min}}, {{lat-max}}, {{lng-max}});out meta;>;out meta qt;````

  and get the baseline number of existing buildings in the AOI
