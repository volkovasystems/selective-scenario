/*
	@title: Select Function
	@author: Richeve S. Bebedor
*/
function select( data, cases, scenarios, callback ){

	return ( function( config ){

		//Initialize configuration variable.
		config = config || { };

		//Limit the flow. This will only happen on cyclic non probablistic flows.
		config.counter = config.counter || 0;
		config.limit = config.limit || 10; //I don't know about the limit.
		if( config.counter > config.limit ){
			throw new Error( "selection procedure overflows" );
		}

		//Initialize the data to be used and make sure to sync it with the config.
		data = config.data || ( config.data = data );
		cases = config.cases || ( config.cases = cases );
		scenarios = config.scenarios || ( config.scenarios = scenarios );
		callback = config.callback || ( config.callback = callback );

		//This is for compatibility.
		var every = config.every 
			|| ( config.every = 
				function every( iterator ){
					var array = this;
					if( !( this instanceof Array ) ){
						throw new Error( "invalid array value" );
					}
					var index = array.length;
					while( index-- ){
						iterator( array[ index ] );
					}
				} );

		//cases is an object consisting of numerical/string 
		//	comparable data.
		//scenarios changes the flow of the case
		var caseCallback = config.caseCallback 
			|| ( config.caseCallback = 
				function caseCallback( error, result ){
					if( error ){
						callback( error );
						return;
					}
					//Scenarios are group of function.
					/*
						The problem here is that if two or more
							scenario satisfy the behavior the flow can
							be non probablistic.
					*/
					if( scenarios instanceof Array ){
						if( typeof scenarios.every != "function" ){
							//I don't know if this binds well.
							scenarios.every = every;
						}
						scenarios.every( function( scene ){
							scene( result, sceneCallback );
						} );
					}else{
						callback( result );
					}
				} );

		/*
			The select function act as a normal switch statement but with super powers.

			I employed several techniques to simulate flow similar to automata schematic.
			I named this selective scenario because scenarios changes the flow of
				the selection by either redirecting the result to another case
				or adding more case for futher redirections.

			Every scene is a condition based from the result of a case.
			The scene can either push the flow to another case to further the data to
				its desired value. Thus this is an enhancement of the switch statement.
			Furthermore, I employed regex capability to the cases making each case
				flexible.
		*/
		var sceneCallback = config.sceneCallback
			|| ( config.sceneCallback = 
				function sceneCallback( error, result, subCases ){
					if( error ){
						callback( error );
						return;
					}

					/*
						A scene can return subcases or suggested cases.
						Sub cases are list of cases for the flow to be redirected.
						At most possible, the case can be redirected to only one case
							or none at all.
						But it is also possible that the case can be redirected to any
							two or more case.

						In the case of suggested cases,
							the case is redirected to a new case.
					*/
					if( subCases instanceof Array ){
						if( typeof subCases.every != "function" ){
							//I don't know if this binds well.
							subCases.every = every;
						}
						subCases.every( function( value ){
							config.data = value;
							config.counter++;
							select( )( config );
						} );
					}else if( subCases && typeof subCases == "object" ){
						for( var key in subCases ){
							cases[ key ] = subCases[ key ];
							config.counter++;
							config.data = key;
							config.cases = cases;
							select( )( config );
						}						
					}else{
						callback( result );
					}
				} );

		if( data in cases ){
			cases[ data ]( data, caseCallback );
		}else{
			var caseList = Object.keys( cases );
			caseList.push( null );
			if( typeof caseList.every != "function" ){
				//I don't know if this binds well.
				caseList.every = every;
			}
			var hasCase = false;
			caseList.every( function( value ){
				if( value != null && !hasCase ){
					if( ( new RegExp( value ) ).test( data ) ){
						hasCase = true;
						cases[ value ]( data, caseCallback );
					}
				}else if( value == null && !hasCase ){
					callback( );
				}
			} );
		}
	} );
}