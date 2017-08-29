RMS.LoadLibrary("rmgen");

var random_terrain = randomizeBiome();

const tMainTerrain = "alpine_snow_a";
const tForestFloor1 = "alpine_forrestfloor_snow";
const tForestFloor2 = "polar_snow_rocks";
const tCliff = ["alpine_cliff", "alpine_cliff_a", "alpine_cliff_b"];
const tHill = "polar_ice_b";
const tRoad = "new_alpine_citytile";
const tRoadWild = "alpine_snow_rocky";
const tShoreBlend = "alpine_shore_rocks_grass_50";
const tShore = "alpine_shore_rocks";
const tWater = "polar_ice_b";

const oTree1 = "gaia/flora_tree_dead";
const oTree2 = "gaia/flora_tree_oak_dead";
const oBush = "gaia/flora_bush_badlands";
const oBerry = "gaia/flora_bush_berry";
const oWolf1 = "gaia/fauna_wolf";
const oWolf2 = "gaia/fauna_wolf_snow";
const oFox = "gaia/fauna_fox_arctic";
const oFish = "gaia/fauna_fish";
const oMuskox = "gaia/fauna_muskox";
const oWalrus = "gaia/fauna_walrus";
const oStoneLarge = "gaia/geology_stonemine_alpine_quarry";
const oStoneSmall = "gaia/geology_stone_alpine_a";
const oMetalLarge = "gaia/geology_metal_alpine";

const aRockLarge = "actor|geology/stone_granite_large.xml";
const aRockMedium = "actor|geology/stone_granite_med.xml";
const aBushMedium = "actor|props/flora/plant_desert_a.xml";
const aBushSmall = "actor|props/flora/bush_desert_a.xml";

const pForest1 = [tForestFloor2 + TERRAIN_SEPARATOR + oTree1, tForestFloor2 + TERRAIN_SEPARATOR + oTree2, tForestFloor2];
const pForest2 = [tForestFloor1 + TERRAIN_SEPARATOR + oTree1, tForestFloor1];

log("Initializing map...");

InitMap();

const numPlayers = getNumPlayers();
const mapSize = getMapSize();

var clWater = createTileClass();
var clPlayer = createTileClass();
var clHill = createTileClass();
var clForest = createTileClass();
var clRock = createTileClass();
var clMetal = createTileClass();
var clFood = createTileClass();
var clBaseResource = createTileClass();
var clRiver = createTileClass();
var clShallow = createTileClass();
var clLand = createTileClass();

for (var ix = 0; ix < mapSize; ix++)
{
	for (var iz = 0; iz < mapSize; iz++)
	{
			placeTerrain(ix, iz, tMainTerrain);
	}
}

// randomize player order
var playerIDs = [];
for (var i = 0; i < numPlayers; i++)
{
	playerIDs.push(i+1);
}
playerIDs = sortPlayers(playerIDs);


var playerX = new Array(numPlayers);
var playerZ = new Array(numPlayers);
var playerAngle = new Array(numPlayers);

var startAngle = randFloat(0, TWO_PI);
for (var i = 0; i < numPlayers; i++)
{
	playerAngle[i] = startAngle + i*TWO_PI/numPlayers;
	playerX[i] = 0.5 + 0.35*cos(playerAngle[i]);
	playerZ[i] = 0.5 + 0.35*sin(playerAngle[i]);
}

for (var i = 0; i < numPlayers; i++)
{
	var id = playerIDs[i];
	log("Creating base for player " + id + "...");

	var radius = scaleByMapSize(15,25);

	// get the x and z in tiles
	var fx = fractionToTiles(playerX[i]);
	var fz = fractionToTiles(playerZ[i]);
	var ix = round(fx);
	var iz = round(fz);
	addToClass(ix, iz, clPlayer);
	addToClass(ix+5, iz, clPlayer);
	addToClass(ix, iz+5, clPlayer);
	addToClass(ix-5, iz, clPlayer);
	addToClass(ix, iz-5, clPlayer);

	// create starting units
	placeCivDefaultEntities(fx, fz, id);

	// create the city patch
	var cityRadius = radius/3;
	var placer = new ClumpPlacer(PI*cityRadius*cityRadius, 0.6, 0.3, 10, ix, iz);
	var painter = new LayeredPainter([tRoadWild, tRoad], [1]);
	createArea(placer, painter, null);

	// create berry bushes
	var bbAngle = randFloat(0, TWO_PI);
	var bbDist = 12;
	var bbX = round(fx + bbDist * cos(bbAngle));
	var bbZ = round(fz + bbDist * sin(bbAngle));
	var group = new SimpleGroup(
		[new SimpleObject(oBerry, 5,5, 0,3)],
		true, clBaseResource, bbX, bbZ
	);
	createObjectGroup(group, 0);

	// create metal mine
	var mAngle = bbAngle;
	while(abs(mAngle - bbAngle) < PI/3)
	{
		mAngle = randFloat(0, TWO_PI);
	}
	var mDist = 12;
	var mX = round(fx + mDist * cos(mAngle));
	var mZ = round(fz + mDist * sin(mAngle));
	group = new SimpleGroup(
		[new SimpleObject(oMetalLarge, 1,1, 0,0)],
		true, clBaseResource, mX, mZ
	);
	createObjectGroup(group, 0);

	// create stone mines
	mAngle += randFloat(PI/8, PI/4);
	mX = round(fx + mDist * cos(mAngle));
	mZ = round(fz + mDist * sin(mAngle));
	group = new SimpleGroup(
		[new SimpleObject(oStoneLarge, 1,1, 0,2)],
		true, clBaseResource, mX, mZ
	);
	createObjectGroup(group, 0);

	// create animals
	for (var j = 0; j < 2; ++j)
	{
		var aAngle = randFloat(0, TWO_PI);
		var aDist = 7;
		var aX = round(fx + aDist * cos(aAngle));
		var aZ = round(fz + aDist * sin(aAngle));
		var group = new SimpleGroup(
			[new SimpleObject(oMuskox, 3,3, 0,2)],
			true, clBaseResource, aX, aZ
		);
		createObjectGroup(group, 0);
	}

	// create starting trees
	var num = 5;
	var tAngle = randFloat(0, TWO_PI);
	var tDist = randFloat(12, 13);
	var tX = round(fx + tDist * cos(tAngle));
	var tZ = round(fz + tDist * sin(tAngle));
	group = new SimpleGroup(
		[new SimpleObject(oTree1, num, num, 0,3)],
		false, clBaseResource, tX, tZ
	);
	createObjectGroup(group, 0, avoidClasses(clBaseResource,2));

	placeDefaultDecoratives(fx, fz, aBushSmall, clBaseResource, radius);
}

RMS.SetProgress(20);

log("Creating bumps...");
placer = new ClumpPlacer(scaleByMapSize(20, 50), 0.3, 0.06, 1);
painter = new SmoothElevationPainter(ELEVATION_MODIFY, 2, 2);
createAreas(
	placer,
	painter,
	avoidClasses(clPlayer, 13),
	scaleByMapSize(300, 800)
);

createBumps();

log("Creating hills...");
if (randBool())
	createHills([tCliff, tCliff, tHill], avoidClasses(clPlayer, 20, clHill, 15), clHill, scaleByMapSize(3, 15));
else
	createMountains(tCliff, avoidClasses(clPlayer, 20, clHill, 15), clHill, scaleByMapSize(3, 15));

createBumps(avoidClasses(clPlayer, 20));

const MIN_TREES = 100;
const MAX_TREES = 800;
const P_FOREST = 0.7;

var totalTrees = scaleByMapSize(MIN_TREES, MAX_TREES);

log("Creating forests...");
createForests(
 [tMainTerrain, tForestFloor1, tForestFloor2, pForest1, pForest2],
 avoidClasses(clPlayer, 20, clForest, 18, clHill, 0),
 clForest,
 1.0,
 random_terrain
);

RMS.SetProgress(50);

const WATER_WIDTH = 0.07;

log("Creating river");
var theta = randFloat(0, 1);
var seed = randFloat(2,3);

for (var ix = 0; ix < mapSize; ix++)
{
	for (var iz = 0; iz < mapSize; iz++)
	{
		var x = ix / (mapSize + 1.0);
		var z = iz / (mapSize + 1.0);

		var h = 0;
		var distToWater = 0;

		h = 5 * (z - 0.5);

		// add the rough shape of the water
		var km = 12/scaleByMapSize(1.5, 2);
		var cu = km*rndRiver(theta+z*0.5*(mapSize/64),seed);
		var zk = z*randFloat(0.995,1.005);
		var xk = x*randFloat(0.995,1.005);
		if (-3.0 < getHeight(ix, iz)){
		if ((xk > cu+((1.0-WATER_WIDTH)/2))&&(xk < cu+((1.0+WATER_WIDTH)/2)))
		{
			if (xk < cu+((1.05-WATER_WIDTH)/2))
			{
				h = -3 + 200.0* abs(cu+((1.05-WATER_WIDTH)/2-xk));
				if ((((zk>0.3)&&(zk<0.4))||((zk>0.5)&&(zk<0.6))||((zk>0.7)&&(zk<0.8)))&&(h<-1.5))
				{
					h=-0.5;
					addToClass(ix, iz, clShallow);
				}

			}
			else if (xk > (cu+(0.95+WATER_WIDTH)/2))
			{
				h = -3 + 200.0*(xk-(cu+((0.95+WATER_WIDTH)/2)));
				if ((((zk>0.3)&&(zk<0.4))||((zk>0.5)&&(zk<0.6))||((zk>0.7)&&(zk<0.8)))&&(h<-1.5))
				{
					h=-0.5;
					addToClass(ix, iz, clShallow);
				}
			}
			else
			{
				if (((zk>0.3)&&(zk<0.4))||((zk>0.5)&&(zk<0.6))||((zk>0.7)&&(zk<0.8))){
					h = -0.5;
					addToClass(ix, iz, clShallow);
				}
				else
				{
					h = -1.0;
				}
			}
			setHeight(ix, iz, h);
			addToClass(ix, iz, clRiver);
			placeTerrain(ix, iz, tWater);
		}
		}
	}
}


log("Creating pools...");
for (var i = 0; i < 7; i++)
{
	placer = new ChainPlacer(1, floor(scaleByMapSize(2, 5)), floor(scaleByMapSize(15, 60)), 0.8);
	var terrainPainter = new LayeredPainter(
		[tShoreBlend, tShore, tWater],
		[1,1]	
	);
	var elevationPainter = new SmoothElevationPainter(ELEVATION_SET, -2, 3);
}
RMS.SetProgress(55);


log("Creating stone mines...");
createMines(
 [
  [new SimpleObject(oStoneSmall, 0,2, 0,4), new SimpleObject(oStoneLarge, 1,1, 0,4)],
  [new SimpleObject(oStoneSmall, 2,5, 1,3)]
 ],
 avoidClasses(clForest, 1, clPlayer, 20, clWater, 3, clMetal, 10, clRock, 5, clHill, 1),
 clRock
);

log("Creating metal mines...");
createMines(
 [
  [new SimpleObject(oMetalLarge, 1,1, 0,4)]
 ],
 avoidClasses(clForest, 1,clWater, 3, clPlayer, 20, clMetal, 10, clRock, 5, clHill, 1),
 clMetal
);

RMS.SetProgress(65);

var planetm = 1;

if (random_terrain == g_BiomeTropic)
	planetm = 8;

createDecoration
(
 [[new SimpleObject(aRockMedium, 1,3, 0,1)],
  [new SimpleObject(aRockLarge, 1,2, 0,1), new SimpleObject(aRockMedium, 1,3, 0,2)],
  [new SimpleObject(aBushMedium, 1,2, 0,2), new SimpleObject(aBushSmall, 2,4, 0,2)]
 ],
 [
  scaleByMapSize(16, 262),
  scaleByMapSize(8, 131),
  planetm * scaleByMapSize(13, 200),
  planetm * scaleByMapSize(13, 200),
  planetm * scaleByMapSize(13, 200)
 ]
);

RMS.SetProgress(70);

createFood
(
 [
  [new SimpleObject(oWolf1, 10,15, 0,4)],
  [new SimpleObject(oWolf2, 10,15, 0,4)],
  [new SimpleObject(oFox, 2,3, 0,4)],
  [new SimpleObject(oMuskox, 5,7, 0,4)],
  [new SimpleObject(oWalrus, 2,3, 0,2)]
 ],
 [
  5 * numPlayers,
  5 * numPlayers,
  3 * numPlayers,
  3 * numPlayers,
  3 * numPlayers
 ],
 avoidClasses(clWater, 3, clPlayer, 20, clHill, 1, clFood, 10)
);

RMS.SetProgress(75);

createFood
(
 [
  [new SimpleObject(oBerry, 5,7, 0,4)]
 ],
 [
  3 * numPlayers
 ],
 avoidClasses(clWater, 5, clPlayer, 20, clHill, 1, clFood, 10)
);

createFood
(
 [
  [new SimpleObject(oFish, 1,3, 0,4)]
 ],
 [
  3 * numPlayers
 ],
 stayClasses(clWater, 1)
);

RMS.SetProgress(85);

var types = [oTree1, oTree2, oBush];
createStragglerTrees(types, [avoidClasses(clForest, 1, clHill, 1, clPlayer, 9, clMetal, 6, clRock, 6, clRiver, 1), stayClasses(clLand, 7)]);

ExportMap();
