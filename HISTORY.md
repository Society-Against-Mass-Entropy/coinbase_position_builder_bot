# 2.4.0
- Added new configuration to support leaving limit rebuy orders on the books longer
  - new CBPP_REBUY_CANCEL environmental variable is the minimum number of minutes you would like the order to remain on the books (note that the cancelation will only occur on the next interval so if you set this to 5 minutes but have a cron job timer set to every hour, the limits will cancel after 1 hour)
  - set to 0 or remove ENV var to have default behavior of canceling on the next action timer
  - NOTE: existing limits in the queue did not have the created_at date so they will be canceled per the default behavior and the new limit orders will take on these new rules

# 2.3.0
- Mathjs needed to be altered to fix floating point rounding issues with javascript numbers
  - math.number((math.add(0.12460097, '0.12035164'))) => 0.24495261000000002
  - math.number((math.add(0.12460097, math.bignumber('0.12035164')))) => 0.24495261
  - now we have a small helper module that uses mathjs to automatically convert to bignumber() and back into a normal javascript Number.
- It is highly recommended to run the `tools/upgrade_2.2.0.js` script if you haven't by now (this will go back and recalculate all of your history data using corrected math and data from the api). See 2.2.0 release for details.

# 2.2.0
- now using response data to correct the funding used to include fees (and to use the actual executed_value) -- Coinbase Pro will not execute $100 when you market buy for $100, it might be 99.996. The fee also takes away from the total reclaimed now
- moving sample configs to `sample.` naming convention
- moving tool scripts to `tools/` folder for organization
- Adding `ID` column in history file (at the end)
- `tools/upgrade_2.2.0.js` script for migrating history file to latest schema (including ID field) and correcting data using real executed_value + fees

## Upgrading History for 2.2.0
You can correct the precision of your history with the updater tool.

This will fetch all of your fill data since the start of the history for the given pair and update the history file to add the ID column and correct the calculations using the more precice data from the order fill payloads:
```
cd tools
# NOTE: change CPBB_APY to your APY (this is just an example)
CPBB_TICKER=BTC CPBB_CURRENCY=USD CPBB_APY=150 node upgrade_2.2.0.js
# run the same for any other tickers you have history to correct
```

# 2.1.1
- aborting script immediately if we failed to load account via the API (shows message about loading keys properly)
- If you cannot start the app due to this message, ensure your API keys are loaded into the environment or api.keys.js file properly then do: `pm2 kill && pm2 start [YOUR_CONFIG_NAME].js`
- startup icons and documentation improvements

# 2.1.0
- Added Rebuy Feature: https://github.com/jasonedison/coinbase_position_builder_bot/pull/7
- removed excess "stable" npm package
- now `stable` is the stable branch
- now `develop` is the development branch
- `tax_fifo.js` tool
- `project.changes.js` tool

# 2.0.0
- `adjust.apy.js` tool
- Corrected target growth calculation to omit adding funding value from a sell action

## Updating to Version 2.0.0

Version `2.0.0` contains a change to the `Target` growth calculation. In older versions, the `Target` growth is calculated as `Prior Target` + `Period Gain` + `Funds` for this round. This makes sense when you are always buying because we are adding to the account, and we want to make sure that if we are over our `Target`, we only sell if the `Value` of the account is greater than `Target` by more than the `Funds` we would be cashing out. However, if you sold on the last round, we now have a target on record that includes `Funds` we didn't add into the system. This still gave us a good algorithmic result since it manifests as a higher than configured `APY` growth in our target calculation, but this creates confusion because the APY isn't the only thing being used to calculate the long term `Target`.

In 2.0.0+, we only add `Funds` to `Target` if the last round was a buy, not a sell.
You can simply upgrade the code and keep running with your existing history log (which likely has a slightly inflated `Target` because any sells still added an expected growth to the baseline). If you decide not to correct historical data, new data will still use the new algorithm. However, if you want to rectify your records, there is an optional script that will do this for you:

(optional)
1. Backup your data directory
2. For each pair you are tracking, run `CPBB_TICKER=BTC CPBB_CURRENCY=USD node adjust.target.js`
3. Examine the new '...fixed.tsv' file to make sure the records look satisfactory
4. Overwrite your history with the fixed version
5. restart your app: `pm2 reload all`
