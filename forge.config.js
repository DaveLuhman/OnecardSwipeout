const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
	packagerConfig: {
		asar: true,
		icon: "./img/icon-256.ico",
		osxSign: { identity: process.env.OSX_IDENTITY },
		osxNotarize: {
			appleId: process.env.APPLE_ID,
			appleIdPassword: process.env.APPLE_PASSWORD,
			teamId: process.env.APPLE_TEAM_ID,
		},
	},
	rebuildConfig: {},
	makers: [
		{
			name: "@electron-forge/maker-wix",
			platforms: ["x86_64"],
			config: {
				language: 1033,
				manufacturer: "ADO Software",
				icon: "./img/favicon.ico",
				name: "Onecard SwipeOut",
				description: "Reads MSR Swipe Data and Outputs 7d Onecard Numbers",
			},
		},
		{
			name: "@electron-forge/maker-pkg",
			config: {
			},
		},
	],
	plugins: [
		{
			name: "@electron-forge/plugin-auto-unpack-natives",
			config: {},
		},
		// Fuses are used to enable/disable various Electron functionality
		// at package time, before code signing the application
		new FusesPlugin({
			version: FuseVersion.V1,
			[FuseV1Options.RunAsNode]: false,
			[FuseV1Options.EnableCookieEncryption]: true,
			[FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
			[FuseV1Options.EnableNodeCliInspectArguments]: false,
			[FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
			[FuseV1Options.OnlyLoadAppFromAsar]: true,
		}),
	],
	publishers: [
		{
			name: "@electron-forge/publisher-github",
			config: {
				repository: {
					owner: "DaveLuhman",
					name: "onecardSwipeout",
				},
				prerelease: true,
			},
		},
	],
};
