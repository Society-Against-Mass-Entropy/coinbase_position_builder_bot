# 3.1.0

- https://github.com/jasonedison/coinbase_position_builder_bot/pull/35:
  - Fix a bug with the expected gain not being calculated in sale transactions:
- Rebuy fixes: https://github.com/jasonedison/coinbase_position_builder_bot/pull/34
  - Do not apply rebuy funds to target (already applied the first time the buy happened)
  - Rebuys no longer add to the TotalInput, preventing adding the same funds to the base input over and over and artificially inflating the target gain
  - The original idea behind rebuy logic was to effectively undo a sell action with a better rate and buy a dip on an upward charge.
    The current logic applies spent funds in rebuy purchases to the `TotalInput`, and adds to an increase In the `Target` value. This is ok, but it means that a lot of rebuy activity can unintuitively increase the `Target` when the expected reason for rebuying is to effectively undo an erroneous sale point (and benefit from a dip).
  - Since we are using `Realized` funds for rebuy actions, we can deduct the rebought funds from `Realized` instead of adding them to `TotalInput`. This prevents the rebuy funds from pivoting upward on the `Target` value of the held funds. Essentially, rebuys let us reduce cost basis as if a part of the sell action didn't happen at the expense of the `Realized` gains bucket.
  - The tools/adjust.apy.js script now fetches fill data from the API in order to see if the record was a Maker or Taker action--rebuys are Makers ("M") and it uses that information to adjust the history to fix the TotalInput and Realized values for rebuys.
  - Ongoing, the funds for rebuys are now deducted from the `Realized` bucket and prevented from adding to the `TotalInput`

> NOTE: for this update, you should run the following (changing to your APY target value for each ticker you track):

```
cd tools
CPBB_TICKER=BTC CPBB_APY=100 node adjust.apy.js
```

> Any time you run tools/adjust.apy.js, you should delete the cached file in data/fills\_\*.json unless you want to use it

# 3.0.0

- New APY calculation using Simple Interest Rate (since we are not compounding based on the period but extrapolating what an annual rate would be with the same growth rate per period)
- Now showing calcualted APY in each log item
- Now showing liquid APY at startup
- Corrected APY adjuster to prevent negative period rate and expected gain calculations with limit orders that filled and logged out of time sequence

# 2.7.6

- Adjust log output to show total $ input and use dollarize method to add $ for USD trades

# 2.7.5

- handling failure to post order case for limit rebuy
- new `tools/get.limits.js` script for restoring limit buy orders on the order books

# 2.7.2

- use product info to calculate precision for limit order size
- reduce log and add note about Insufficient Funds
- validate rebuy size and drop points before startup
- use multiply and divide everywhere
- correct rounding error on printing drop target with limit order status (just in log)

# 2.7.0

- More tests!
- When new users start, log `0` for profit instead of `undefined`
- No longer requiring negative sign on CPBB_REBUY configs (they are still valid but the rebuy percentage drop point is automatically converted to a negative percentage)
- New configuration option and recommendation for REBUY that collapses the size and percentage drop point into one, which prevents accidentally defining a drop point with no target (uneven definitions). This also makes it easier to see side by side at what percentage drop point you would be setting a limit buy to recapture the size:

```
CPBB_REBUY: '.0001@4,.0002@6,.0004@8,.0008@10,.001@12,.002@15,.004@20,.008@25,.016@30,.032@35,.064@40,.128@50,.256@60,.512@70,1.024@80,2.048@90',
```

This replaces the former config that looked like this (also still supported and valid):

```
CPBB_REBUY_SIZE: '.0001,.0002,.0004,.0008,.001,.002,.004,.008,.016,.032,.064,.128,.256,.512,1.024,2.048',
CPBB_REBUY_AT: '-4,-6,-8,-10,-12,-15,-20,-25,-30,-35,-40,-50,-60,-70,-80,-90',
```

The above version is not recommended but will continue to be supported until the next major version upgrade.

# 2.6.0

- New Rebuild/Rebuy algorithm uses ALL of MAX funds. The remainder of the funds will be applied to the next drop point. If that creates an order that is too small to place based on the `base_min_size`, it will be added to the previous valid order size.

### Example Rebuy Running against ETH-USD

```
⚡ Creating limit orders to rebuy $15 worth of ETH starting from $1525.77
⬇️  posted limit order for 0.001 ETH @ 1464.74 = $1.4647 (-4% drop)
⬇️  posted limit order for 0.002 ETH @ 1434.22 = $2.8684 (-6% drop)
⬇️  posted limit order for 0.003 ETH @ 1403.71 = $4.2111 (-8% drop)
⬇️  posted limit order for 0.00471722 ETH @ 1373.19 = $6.4558 (-10% drop)
✅ REBUY: Added 4 limit buys totaling $15. Now 14 limit orders totaling $72.1509
```

In this case, there was a remainder of `0.00071722` ETH which is too small for the minimum order size according to the API. So we took that size and added it to the previous valid order (.004) to use all the $15 available.

- fixed rebuy base-price calculation
- `tools/project.changes.js` fixed to work with new libraries
- APY and ID are no longer parsed in memory as number (NaN), which didn't break anything but good to not do
- now stripping commas out of log history (if they exist): fixes #12
- upgrade dependencies and nvm to stable (15.10.0)
- now better handling response states from API
- lots of logging improvements

# 2.5.3

- Fix bug with running engine without CPBB_REBUY_AT being set in ENV
- now using prettier and eslint together for code format
- adding unit tests

# 2.5.2

- fix but with saving history item for a rebuy order (price from API is not a number and cannot be toFixed() until cast)

# 2.5.1

- Fix bug where rebuilding the rebuy orders can cause 429 rate limiting errors
- merging in unit test ability with Jest: https://github.com/jasonedison/coinbase_position_builder_bot/pull/14

# 2.5.0

- New configuration of `CPBB_REBUY_REBUILD`, which is a number of active limit orders on the books to consider the set ready for a rebuild based on the existing rebuy SIZE/AT config.
- NOTE: this is only useful if you have `CPBB_REBUY_CANCEL` set to something other than 0, where limit orders can pile up over many runs. By default, limit orders are canceled on the next cron.
- If `CPBB_REBUY_REBUILD` is triggered, existing limit orders will be canceled and new orders will be built from the highest price of the order set, and using the total `funds` from the limit orders on the books. For example, if you normally put $50 into rebuy orders, but the rebuy limits have piled up through several sell operations, you might have 20 limit orders worth $120 on the books, all accumulated in one region. Setting `CPBB_REBUY_REBUILD` to 20 (or less) will cause the next run to cancel these limit orders and build a new set of limit orders up to $120, up to the number of drop points configured in `CPBB_REBUY_AT`
- Resuming checking each limit order to be sure they haven't been manually deleted
- Removing 404 limit orders from tracking (limit orders can be manually deleted or deleted by Coinbase system maintenance)
- Correcting rate limiting issues by sleeping between rebuy checks and posts
- New Tool: `tools/create.history.js` - goes through entire coinbase pro fill history for a trading pair and generates a history file from that data. NOTE: if you bought/sold crypto via Coinbase and moved in in and out of Coinbase Pro, you can end up with negative holdings at points in the history file because it only has access to the Coinbase Pro side.

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
