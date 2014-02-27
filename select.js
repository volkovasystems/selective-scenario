/*:
	@include:
		{
			"generate-random-mean-time": "generateRandomMeanTime"
		}
	@end-include
*/
select = function select( value, cases, callback ){
	/*
		A case consist of a condition of acceptance
			or redirection and an affecting scenario.

		By default of a switch case, a switch case
			contains a value and several cases (condition)
			if a case fails you can redirect it to the next case
			but if the case matches, it will execute
			procedures (scenario)

		Selective scenario algorithm takes it to the next level.
		[
			{
				"namespace": "this is optional",
				"condition": function condition( scope, redirect ){
					The condition will check the scope's value property
						and either returns true or redirect
						the flow to a case.

					If the condition is accepted, it will
						execute the corresponding scenario.
					
					If the condition fails, it will either
						redirects the flow to other
						cases or end the flow.

					redirect( error | null, true ) 
						Executes the scenario.
					redirect( error | null, namespace | [namespace] | null ) 
						Executes the next case or the chosen cases.
					redirect( error )
						Stops the flow because an error occurs.
					redirect( error | null, false )
						End the flow.

					Note that if a case requires to execute
						three redirecting cases then
						it should complete the flow for the 
						three cases unless redirect to end.

					The condition should return true or false.
				},
				"scenario": function scenario( scope, redirect ){
					Scenario modifies the scope or inspect
						the scope.
					It will execute certain task and redirects the flow.
				}
			}
		]
	*/
	var scope = {
		"value": value
	};
	var processes = [ ];
	var killProcesses = function killProcesses( callback ){
		for( var index = 0; index < processes.length; index++ ){
			clearTimeout( processes[ index ] );
		}
		callback(  );
	}	
	var redirect = function redirect( error, state ){
		var namespace = this.namespace;
		if( error ){
			//Do this last!
			killProcesses( function( ){
				callback( error, scope );
			} );
			return false;
		}

		if( state === false ){
			killProcesses( function( ){
				callback( error, scope );
			} );
			return false;
		}

		if( typeof state == "string" ){

		}else if( state instanceof Array ){

		}else{

		}
	};

	var processQueue = { };

	for( var in dex = 0; index < cases.length; index++ ){
		processes.push( setTimeout( function process( index ){
			var thisCase = cases[ index ];
			if( !( "namespace" in thisCase ) ){
				thisCase.namespace = generateRandomMeanTime( );
			}
			var namespace = thisCase.namespace;
			var condition = thisCase.condition;
			var scenario = thisCase.scenario;
			if( condition( scope, 
				function subRedirect( error, state ){
					redirect.call( { "namespace": namespace }, error, state );
				} ) )
			{
				scenario( scope,
					function subRedirect( error, state ){
						redirect.call( { "namespace": namespace }, error, state );
					} );
			}
		}, 0, index ) );
	}
};