Engine.LoadLibrary("rmgen");

const tMainTerrain = "alpine_snow_a";
const tForestFloor1 = "alpine_forrestfloor_snow";
const tForestFloor2 = "polar_snow_rocks";
const tCliff = ["alpine_cliff", "alpine_cliff_a", "alpine_cliff_b"];
const tHill = "polar_ice_b";
const tRoad = "new_alpine_citytile";
const tRoadWild = "alpine_snow_rocky";
const tShoreBlend = "alpine_snow_b";
const tShore = "alpine_shore_rocks_icy";
const tWater = "polar_ice_b";

const oTree1 = "gaia/flora_tree_dead";
const oTree2 = "gaia/flora_tree_oak_dead";
const oTree3 = "gaia/flora_tree_pine";
const oBush = "gaia/flora_bush_badlands";
const oBerry = "gaia/flora_bush_berry";
const oWolf1 = "gaia/fauna_wolf";
const oWolf2 = "gaia/fauna_arctic_wolf";
const oFox = "gaia/fauna_fox_arctic";
const oHawk = "gaia/fauna_hawk";
const oFish = "gaia/fauna_fish";
const oMuskox = "gaia/fauna_muskox";
const oWalrus = "gaia/fauna_walrus";
const oStoneLarge = "gaia/geology_stonemine_alpine_quarry";
const oStoneSmall = "gaia/geology_stone_alpine_a";
const oMetalLarge = "gaia/geology_metal_alpine_slabs";

const aRockLarge = "actor|geology/stone_granite_large.xml";
const aRockMedium = "actor|geology/stone_granite_med.xml";
const aBushMedium = "actor|props/flora/plant_desert_a.xml";
const aBushSmall = "actor|props/flora/bush_desert_a.xml";

const pForest1 = [tForestFloor2 + TERRAIN_SEPARATOR + oTree1, tForestFloor2 + TERRAIN_SEPARATOR + oTree2, tForestFloor2];
const pForest2 = [tForestFloor1 + TERRAIN_SEPARATOR + oTree1, tForestFloor1];

log("Initializing map...");

InitMap();

const numPlayers = getNumPlayers();
const mapCenter = getMapCenter();
const mapBounds = getMapBounds();

var clPlayer = createTileClass();
var clForest = createTileClass();
var clWater = createTileClass();
var clRock = createTileClass();
var clMetal = createTileClass();
var clFood = createTileClass();
var clBaseResource = createTileClass();
var clHill = createTileClass();
var clRiver = createTileClass();

var waterHeight = -2;
var shoreHeight = 1;
var landHeight = 2;

initTerrain(tMainTerrain);

placePlayerBases({
	"PlayerPlacement": playerPlacementRiver(0, fractionToTiles(0.6)),
	"PlayerTileClass": clPlayer,
	"BaseResourceClass": clBaseResource,
	"CityPatch": {
		"outerTerrain": tRoadWild,
		"innerTerrain": tRoad
	},
	"Chicken": {
	},
	"Berries": {
		"template": oBerry
	},
	"Mines": {
		"types": [
			{ "template": oMetalLarge },
			{ "template": oStoneLarge }
		]
	},
	"Trees": {
		"template": oTree1,
		"count": 10
	},
	"Decoratives": {
		"template": aBushSmall
	}
});

Engine.SetProgress(20);

paintRiver({
	"parallel": false,
	"start": new Vector2D(mapCenter.x, mapBounds.top),
	"end": new Vector2D(mapCenter.x, mapBounds.bottom),
	"width": fractionToTiles(0.1),
	"fadeDist": scaleByMapSize(3, 14),
	"deviation": 6,
	"waterHeight": waterHeight,
	"landHeight": landHeight,
	"meanderShort": 40,
	"meanderLong": 20,
	clRiver
});


log("Creating pools...");
for (let i = 0; i < 7; ++i)
	createAreas(
		 new ChainPlacer(1, Math.floor(scaleByMapSize(2, 5)), Math.floor(scaleByMapSize(15, 60)), 0.8),
	[
			new LayeredPainter([tShoreBlend, tShore, tWater], [1, 1]),
			new SmoothElevationPainter(ELEVATION_SET, -2, 3),
			paintClass(clWater)
		],
		avoidClasses(clPlayer, 20, clWater, 40, clRiver, 20),
		scaleByMapSize(2,20));

Engine.SetProgress(40);

paintTileClassBasedOnHeight(-Infinity, 0.7, Elevation_ExcludeMin_ExcludeMax, clWater);

paintTerrainBasedOnHeight(-Infinity, shoreHeight, Elevation_ExcludeMin_ExcludeMax, tWater);
paintTerrainBasedOnHeight(shoreHeight, landHeight, Elevation_ExcludeMin_ExcludeMax, tShore);

createBumps(avoidClasses(clRiver, 10));

var [forestTrees, stragglerTrees] = getTreeCounts(100, 800, 0.7);
createForests(
	[tForestFloor1, tForestFloor2, tForestFloor1, pForest1, pForest2],
	avoidClasses(clPlayer, 20, clForest, 17, clWater, 10, clBaseResource, 3, clRiver, 10),
	clForest,
	forestTrees);

log("Creating hills...");
if (randBool())
	createHills([tCliff, tCliff, tHill], avoidClasses(clPlayer, 20, clHill, 15), clHill, scaleByMapSize(3, 15));
else
	createMountains(tCliff, avoidClasses(clPlayer, 20, clHill, 15, clWater, 10, clRiver, 10), clHill, scaleByMapSize(3, 15));

createBumps(avoidClasses(clPlayer, 20));

Engine.SetProgress(55);

log("Creating bumps...");
createAreas(
	new ClumpPlacer(scaleByMapSize(20, 50), 0.3, 0.06, 1),
	new SmoothElevationPainter(ELEVATION_MODIFY, 4, 3),
	avoidClasses(clRiver, 6),
	scaleByMapSize(300, 800));

log("Creating stone mines...");
createMines(
	[
		  [new SimpleObject(oStoneSmall, 0, 2, 0, 4), new SimpleObject(oStoneLarge, 1, 1, 0, 4)],
		  [new SimpleObject(oStoneSmall, 2, 5, 1, 3)]
	],
	avoidClasses(clForest, 1, clPlayer, 20, clWater, 3, clMetal, 10, clRock, 5, clHill, 1),
	clRock);

log("Creating metal mines...");
createMines(
	[
		[new SimpleObject(oMetalLarge, 1, 1, 0, 4)]
	],
	avoidClasses(clForest, 1,clWater, 3, clPlayer, 20, clMetal, 10, clRock, 5, clHill, 1),
	clMetal);

Engine.SetProgress(65);

createDecoration(
	[
		[
			new SimpleObject(aRockMedium, 1, 3, 0, 1)
		],
		[
			new SimpleObject(aBushSmall, 1, 2, 0, 1),
			new SimpleObject(aBushMedium, 1, 3, 0, 2),
			new SimpleObject(aRockLarge, 1, 2, 0, 1)
		]
	],
	[
		scaleByMapSize(16, 262),
		scaleByMapSize(40, 360)
	],
	avoidClasses(clWater, 2, clForest, 0, clPlayer, 0, clHill, 1));


Engine.SetProgress(70);

createFood(
	[
		[new SimpleObject(oHawk, 1, 1, 0, 3)],
		[new SimpleObject(oWolf1, 4, 6, 0, 4)],
		[new SimpleObject(oWolf2, 4, 8, 0, 4)],
		[new SimpleObject(oFox, 2, 3, 0, 4)],
		[new SimpleObject(oMuskox, 5, 7, 0, 4)],
		[new SimpleObject(oWalrus, 2, 4, 0, 2)]
	],
	[
		scaleByMapSize(3, 10),
		scaleByMapSize(5, 20),
		scaleByMapSize(5, 20),
		scaleByMapSize(5, 20),
		scaleByMapSize(5, 20),
		scaleByMapSize(3, 15)
 ],
 avoidClasses(clWater, 3, clPlayer, 20, clHill, 1, clFood, 10));

Engine.SetProgress(75);

createFood(
	[
		[new SimpleObject(oBerry, 3, 6, 0, 4)]
	],
	[
		scaleByMapSize(3, 10)
	],
	avoidClasses(clWater, 3, clForest, 0, clPlayer, 20, clHill, 1, clFood, 10),
	clFood);

Engine.SetProgress(90);

createFood(
	[
		[new SimpleObject(oFish, 1, 2, 0, 2)]
	],
	[
		3 * numPlayers
	],
	[avoidClasses(clPlayer, 8, clForest, 1, clHill, 4), stayClasses (clWater, 6)],
	clFood);

var types = [oTree1, oTree2, oTree3, oBush];
createStragglerTrees(
	types,
	avoidClasses(clForest, 1, clWater, 2, clPlayer, 12, clMetal, 6, clHill, 1),
	clForest,
	stragglerTrees);

placePlayersNomad(clPlayer, avoidClasses(clForest, 1, clMetal, 4, clRock, 4, clHill, 4, clFood, 2));

setSkySet(pickRandom(["fog", "stormy", "sunrise", "sunset"]));
setSunElevation(0.27);
setSunRotation(randomAngle());
setSunColor(0.746, 0.718, 0.539);
setWaterColor(0.292, 0.347, 0.691);
setWaterTint(0.550, 0.543, 0.437);
setWaterMurkiness(0.83);

setFogColor(0.8, 0.76, 0.61);
setFogThickness(2);
setFogFactor(1.2);

setPPEffect("hdr");
setPPContrast(0.65);
setPPSaturation(0.42);
setPPBloom(0.6);

ExportMap();
