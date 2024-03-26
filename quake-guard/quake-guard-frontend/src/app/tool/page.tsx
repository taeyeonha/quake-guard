"use client";
import React, { useState } from "react";

// States
enum LoadingState {
	UNLOADED,
	LOADING,
	LOADED,
}

// Components
export default function ToolPage() {
	// City, State, Country
	const [city, setCity] = useState("");
	const [state, setState] = useState("");
	const [country, setCountry] = useState("");
	const [extended, setExtended] = useState(false);

	// Loading state
	const [loadState, setLoadState] = useState(LoadingState.UNLOADED);
	const [data, setData] = useState<{
		num_earthquakes?: number;
		avg_magnitude?: number;
		avg_depth?: number;
		highest_magnitude?: number;
		lowest_magnitude?: number;
		lat?: number;
		lng?: number;
		predicted_magnitude?: number;
		risk?: string;
		details?: string;
	}>({});

	const submitFunction = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoadState(LoadingState.LOADING);
		await fetch("http://localhost:8000/api", {
			method: "POST",
			body: JSON.stringify({
				city: city,
				region: state,
				country: country,
				extended: extended,
			}),
			headers: {
				"Content-Type": "application/json",
			},
			mode: "cors",
		})
			.then((res) => res.json())
			.then((res) => {
				var new_data: {
					predicted_magnitude?: number;
					lat?: number;
					lng?: number;
					num_earthquakes?: number;
					avg_magnitude?: number;
					avg_depth?: number;
					highest_magnitude?: number;
					lowest_magnitude?: number;
					risk?: string;
					details?: string;
				} = {};
				new_data["predicted_magnitude"] = res["predicted_magnitude"];
				new_data["lat"] = res["lat"];
				new_data["lng"] = res["lng"];
				if (extended) {
					new_data["num_earthquakes"] = res["num_earthquakes"];
					new_data["avg_magnitude"] = res["avg_magnitude"];
					new_data["avg_depth"] = res["avg_depth"];
					new_data["highest_magnitude"] = res["highest_magnitude"];
					new_data["lowest_magnitude"] = res["lowest_magnitude"];
				}
				setData(new_data);

				console.log(res["predicted_magnitude"]);

				let predicted_magnitude: number = res["predicted_magnitude"];
				if (predicted_magnitude < 3.5) {
					new_data["risk"] = "Low";
					new_data["details"] =
						"Recorded on local seismographs, but generally not felt.";
				} else if (predicted_magnitude < 5.5) {
					new_data["risk"] = "Low";
					new_data["details"] =
						"Often felt, but rarely cause damage.";
				} else if (predicted_magnitude < 6) {
					new_data["risk"] = "Moderate";
					new_data["details"] =
						"At most slight damage to well-designed buildings. Can cause major damage to poorly constructed buildings over small regions.";
				} else if (predicted_magnitude < 7) {
					new_data["risk"] = "High";
					new_data["details"] =
						"Can cause damage to poorly constructed buildings and other structures in areas up to about 100 kilometers across where people live.";
				} else if (predicted_magnitude < 8) {
					new_data["risk"] = "High";
					new_data["details"] =
						"'Major' earthquake. Can cause serious damage over larger areas.";
				} else if (predicted_magnitude < 9) {
					new_data["risk"] = "High";
					new_data["details"] =
						"'Great' earthquake. Can cause serious damage and loss of life in areas several hundred kilometers across.";
				} else {
					new_data["risk"] = "High";
					new_data["details"] =
						"Rare great earthquake. Can cause major damage over a large region over 1000 km across.";
				}

				setLoadState(LoadingState.LOADED);
			});
	};

	return (
		<div className='flex-1 relative bg-[url("/mountains.jpg")]'>
			<div
				className={
					"inset-0 absolute h-full z-20 backdrop-blur-sm bg-white/30 " +
					(loadState == LoadingState.LOADING ? "block" : "hidden")
				}
			>
				<div className='flex flex-row h-full'>
					<div className='flex-1' />
					<div className='flex flex-col h-full pt-10 z-10'>
						<div className='shadow-2xl backdrop-blur-sm bg-gray-400/2 rounded-xl p-4'>
							<h1 className='text-4xl font-bold py-5 text-center'>
								This may take a minute...
							</h1>
							<p>
								Quite literally if you chose the extended option
							</p>
							<button
								type='button'
								className='inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition ease-in-out duration-150 cursor-not-allowed'
								disabled
							>
								<svg
									className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
									xmlns='http://www.w3.org/2000/svg'
									fill='none'
									viewBox='0 0 24 24'
								>
									<circle
										className='opacity-25'
										cx='12'
										cy='12'
										r='10'
										stroke='currentColor'
										strokeWidth='4'
									></circle>
									<path
										className='opacity-75'
										fill='currentColor'
										d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
									></path>
								</svg>
								Processing...
							</button>
						</div>
					</div>
					<div className='flex-1' />
				</div>
			</div>

			<div className='flex flex-col h-full inset-0 z-10'>
				<div className='p-10'></div>
				<div className='flex-1 flex flex-row'>
					<div className='flex-1'></div>
					<div className='flex-1 rounded-xl p-4 shadow-2xl backdrop-blur-sm bg-white/30 z-10'>
						<h1 className='text-4xl font-bold py-5'>Location</h1>
						<form
							className='flex flex-col'
							onSubmit={submitFunction}
						>
							<div className='flex flex-col py-4'>
								<label htmlFor='city'>City</label>
								<input
									type='text'
									name='city'
									id='city'
									className='rounded p-2'
									value={city}
									onChange={(e) => setCity(e.target.value)}
								/>
							</div>
							<div className='flex flex-col py-4'>
								<label htmlFor='state' className='py-2'>
									State
								</label>
								<input
									type='text'
									name='state'
									id='state'
									className='rounded p-2'
									value={state}
									onChange={(e) => setState(e.target.value)}
								/>
							</div>
							<div className='flex flex-col py-4'>
								<label htmlFor='country' className='py-2'>
									Country
								</label>
								<input
									type='text'
									name='country'
									id='country'
									className='rounded p-2'
									value={country}
									onChange={(e) => setCountry(e.target.value)}
								/>
							</div>
							<div className='flex flex-col py-4'>
								<label htmlFor='extended' className='py-2'>
									Extended
								</label>
								<label className='relative inline-flex items-center cursor-pointer'>
									<input
										type='checkbox'
										value=''
										className='sr-only peer'
										id='extended'
										name='extended'
										onClick={() => setExtended(!extended)}
									/>
									<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
								</label>
							</div>
							<div className='flex flex-col py-2'>
								<button
									type='submit'
									className='rounded-lg bg-black hover:bg-gray-700 text-white py-2 px-4'
								>
									Submit
								</button>
							</div>
						</form>
					</div>
					<div className='p-4'></div>
					<div className='flex-1 rounded-xl p-4 shadow-2xl backdrop-blur-sm bg-white/30 z-10'>
						<div className='py-5'>
							<h1 className='text-4xl font-bold'>Statistics</h1>
							(of nearby Area)
						</div>
						<div className='grid grid-cols-2 text-md'>
							<div className='py-2'>
								Count of Previous Earthquakes
							</div>
							<div className='flex flex-col py-2'>
								{data.num_earthquakes
									? data.num_earthquakes
									: "N/A"}
							</div>

							<div className='py-2'>
								Average Magnitude of Previous Earthquakes
							</div>
							<div className='flex flex-col py-2'>
								{data.avg_magnitude
									? Math.round(data.avg_magnitude * 100) / 100
									: "N/A"}
							</div>
							<div className='py-2'>Average Depth</div>
							<div className='flex flex-col py-2'>
								{data.avg_depth ? data.avg_depth : "N/A"}
							</div>

							<div className='py-2'>Lowest Magnitude</div>
							<div className='flex flex-col py-2'>
								{data.lowest_magnitude
									? Math.round(data.lowest_magnitude * 100) /
									  100
									: "N/A"}
							</div>

							<div className='py-2'>Highest Magnitude</div>
							<div className='flex flex-col py-2'>
								{data.highest_magnitude
									? Math.round(data.highest_magnitude * 100) /
									  100
									: "N/A"}
							</div>

							<div className='py-2'>Latitude</div>
							<div className='py-2'>
								{data.lat
									? Math.round(data.lat * 1000000) / 1000000
									: "N/A"}
							</div>

							<div className='py-2'>Longitude</div>
							<div className='py-2'>
								{data.lng
									? Math.round(data.lng * 1000000) / 1000000 : "N/A"}
							</div>
						</div>
					</div>
					<div className='p-4'></div>
					<div className='flex-1 rounded-xl p-4 shadow-2xl backdrop-blur-sm bg-white/30 z-10'>
						<div className='py-5'>
							<h1 className='text-4xl font-bold'>Summary</h1>
						</div>
						<div className='grid grid-cols-2 text-md'>
							<div className='py-2'>Risk</div>
							<div className='flex flex-col py-2'>
								{data.risk ? data.risk : "N/A"}
							</div>

							<div className='py-2'>Predicted Magnitude</div>
							<div className='flex flex-col py-2'>
								{data.predicted_magnitude
									? data.predicted_magnitude
									: "N/A"}
							</div>
							<div className='py-2'>Details</div>
							<div className='flex flex-col py-2'>
								{data.details ? data.details : "N/A"}
							</div>
						</div>
					</div>
					<div className='flex-1'></div>
				</div>
				<div className='p-10'></div>
			</div>
		</div>
	);
}
