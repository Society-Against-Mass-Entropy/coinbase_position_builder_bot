# Coinbase Position Builder Bot

> Position Building Bot for Accumulating Bitcoin (or other currencies) via Coinbase, while taking advantage of pumps.

We don't need to look at charts. The trendlines and price predictions don't matter. All that matters is your current cost-basis and investment. Are you in profit? Is the price a dip relative to your current holdings? These questions are easy to answer without having to be an oracle. You just have to keep track of your investments, calculate where you fall at the current moment, and automate an action. That's what this project does!

This bot will make a market taker action of the configured funding level at the configured interval. If the current holdings that the bot has accumulated is at a profit point higher than a target APY (and the action volume will keep the holdings at a value higher than the APY), then it will make a sell action, else it makes a buy action.

Here is a view of my first 1 BTC purchased via this method (in a Google Sheet for charting):
![history](docs/cbpp_charts.png 'First 1 BTC Accumulated')

And here is a view of the bot running for a full year (in a Google Sheet for charting):
![history](docs/cbpp_year.png 'First year of automation')

After running this engine for a bit, you can copy the data in your local log file (e.g. `./data/history.BTC-USD.tsv`) and paste it into the spreadsheet template by [creating a copy of this Google Docs Sheet](https://docs.google.com/spreadsheets/d/1DPo9amEx6RAr33Nnaq27J59AA7XiO90Q2bBP9rq2Tiw/edit?usp=sharing). This template can be saved locally and periodically updated or saved to Google Docs or some other service for backup.

## WARNING

This tool is built for my own personal use--and while I have published it publicly for others to use/enjoy, please beware that usage of this tool is at your own risk. I have not accounted for all edge cases as I watch and tune this code as an experiment in-progress.

## Getting Started

This project is written in Node.js. You will need to have Node installed on the machine that will run this app. If you don't have it, I recommend using [nvm](https://github.com/nvm-sh/nvm) to install Node.js.

This is all much easier on a Linux/Mac environment with a shell. I have not tried installing and running this on Windows.

1. Install [Node.js](https://nodejs.org/en/) or via NVM
2. Optional: Install a good text editor (like https://code.visualstudio.com/)

- After install, F1 and type "shell command"
- install shell extension so you can type `code .` in a terminal to open the project up in the editor

3. git clone this project (via terminal) -- or download zip file and unzip

```
git clone https://github.com/Society-Against-Mass-Entropy/coinbase_position_builder_bot.git
cd coinbase_position_builder_bot
```

4. Install dependencies and PM2 (process manager)

```
npm run setup
```

5. Create a Coinbase account (if you don't already have one)
6. Connect a bank account and transfer in some money (you will need to make sure you keep your USD balance fed with enough runway to keep buying during a bear market)
7. Create API Key, and secret on Coinbase: https://www.coinbase.com/settings/api

- note: api key will not work for 48 hours
- must have `view`+`trade` permissions
- there is no need to allow `transfers` (this script does not move money to/from your bank account)
- recommended to limit the API keys to IP address restriction list

8. Add the key and secret to your environment via environmental variables, or add them to the `./api.key.js` file (BUT DO NOT COMMIT THIS FILE TO GIT OR PUBLISH ONLINE)
9. Test all the configs in dry run mode at 1 minute intervals:

```
pm2 start run.dry.all.minute.config.js && pm2 logs
```

10. Kill it

```
pm2 kill
```

11. Now copy one of the sample configs (e.g. run.default.btcusd.config.js)

```
cp run.default.btcusd.config.js run.config.js
```

12. Edit your new `run.config.js` to have the APY and VOLUME values you want by editing `CPBB_APY` and `CPBB_VOL`, respectively.
13. Adjust the run time interval to suit your preferences. You can use https://crontab.guru/#5_*/12_*__\__ to help turn your desired frequency into the crontab syntax that goes in `CPBB_FREQ`
14. Now run it for real

```
pm2 start run.config.js && pm2 logs
```

15. Setup PM2 to save this as a startup task: `pm2 startup`
16. save current configuration `pm2 save`

[PM2 Docs](https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/)
[PM2 Startup Docs] More info on PM2 startup: https://pm2.keymetrics.io/docs/usage/startup/

## Upgrading The Project Version

### Git Cloned Directly

If you downloaded the project via a `git clone`, upgrading is super easy:

1. Make sure you are on the right branch: `git checkout stable` (stable for latest stable release, develop for next release)
2. `git pull --rebase --autostash`
3. You should be all set. PM2 watches the directory and will restart the processes with the latest code. All done.

### Git Clone Via Fork

If you have code that you want to modify or pull-request into this project through your own fork, you can manage your fork like so:

```
git clone [YOUR_FORK_PATH];
cd coinbase_position_builder_bot;
git remote add upstream git@github.com:Society-Against-Mass-Entropy/coinbase_position_builder_bot.git;
git fetch upstream;
git checkout develop;
git merge upstream/develop;
npm i;
npm test;
```

Latest code will always be commited to `develop`. When releases are made, they are merged into the `stable` branch.

Please make pull-requests to `develop` branch and run `npm test` before making a pull-request.
We use `Prettier` and `eslint` for formatting so make sure those are set as well. You can format any pull-requests with:

```
npm run format
```

### Zip File Download

If you downloaded the project via a zip file, it's a bit more complicated.

1. Download the latest release zip file: https://github.com/Society-Against-Mass-Entropy/coinbase_position_builder_bot/releases
2. unzip
3. run `npm i` in the folder
4. copy your `./data/history*` files from your old project directory
5. copy your `./data/maker.orders*` files from your old project directory (if they exist, version > 2.1.0)
6. copy your custom run.\*.config.js file (with your config setup)
7. Ensure that your keys are in your environment by doing `echo $CPBB_APIKEY` -- this should be the value you set (if it returns nothing, your environmental variables are not set right). If you had set your keys in api.keys.js (not recommended but useful if you don't know how to set environmental variables), make sure you copied that file from your old project
8. run `pm2 kill` to stop all running pm2 processes
9. run `pm2 start [YOUR_CONFIG_NAME].config.js` (e.g. `pm2 start run.mine.config.js`)

## Changing Config Settings

If you edit your \*.config.js file with new values, you will have to kill pm2 and start your app from the config fresh. pm2 restart and reload does not read new environmental variables.

1. Edit your config file
2. run `pm2 kill` to stop all running pm2 processes
3. run `pm2 start [YOUR_CONFIG_NAME].config.js` (e.g. `pm2 start run.mine.config.js`)

### Default Configuration

Note: the default settings will take a $10 action every 12 hours on BTCUSD. If Bitcoin sustains a bear market for a full year, this would amount to spending $20/day = $140/week = $7,300/year on Bitcoin (always accumulating). If the price fluctuates enough to cross the profitability threshold (default 15% APY), it may sell upward and sustain itself with a floating balance for a while.

The defaults can be overridden with environmental variables (or update in the run.\*.config.js files with pm2):

```
export CPBB_APY=15 # 15% APY (sell above this gain)
export CPBB_VOL=10 # take $10 actions at configured frequency
export CPBB_FREQ="5 */8 * * *" # crontab description of task frequency (every 8 hours, on the 33rd minute) - https://crontab.guru/every-8-hours
export CPBB_TICKER=BTC
export CPBB_CURRENCY=USD # this is the account we will take buy/sell actions on (money will move in and out of this, exchanged for CPBB_TICKER)
```

### Rebuy Configuration

Since 2.1.0, we have a rebuy feature that will set limit orders to rebuy some of the sold asset if it drops to a specified target % drop point between checking periods.

If you start the app with a config of CPBB_REBUY_MAX greater than 0, it will invoke the following behavioral change on each cron job:

1. Check status of existing limit orders, add any filled ones to the history, and cancel any unfilled ones
2. Perform normal action (using latest history, which may have been modified by limit orders)
3. If the action was a `SELL`, set new limit orders

There are two sample configs that illustrate how this can be configured:

- `sample.btcusd.limit_only.config.js`
- `sample.btcusd.rebuy.config.js`

```
// should the engine only create and manage the limit orders and not make normal accumulation trades
// useful for testing this feature
// or for running a bot that only wants to accumulate an asset via dips
CPBB_REBUY_ONLY: false,
// maximum dollar value consumed by limit order placements
CPBB_REBUY_MAX: 50,
// NOTE: as of 2021-02-22, Coinbase has the following minimum order sizes:
// BTC minimum order is .0001 ($5 at $50K)
// ETH minimum order is .001 ($5 at $5K)
// LTC minimum order is .01 ($5 at $500)
// DASH minimum order is .01 ($5 at $500)
// etc: try to make absurdly small limit orders via coinbase UI to get an error with the limit
// these could change in the future and allow you to make smaller size rebuy trades
// rebuy logic will place up to  orders at this size until CPBB_REBUY_MAX is reached
CPBB_REBUY: '.0001@4,.0002@6,.0003@8,.0004@10,.0005@12,.001@15,.002@20,.004@25,.008@30,.016@35,.032@40,.064@50,.128@60,.256@70,.512@80,1.024@90',
// default behavior is on the next action point (if they didn't fill)
// if CPBB_REBUY_CANCEL is set, this is a number of minutes after the limit order
// creation timestamp that it will be considered ready to cancel if not filled
// NOTE: the rebuy check/cancel is run on your CPBB_FREQ interval so setting this to
// 5 minutes with a daily job timer will cancel the order after 1 day, not 5 minutes
// set to 0 or remove ENV var to have default behavior of canceling on the next
// action timer
// below is a config to leave the order for a minimum time of 3 days
CPBB_REBUY_CANCEL: 60 * 24 * 3,
// if there are twelve unfilled limit orders remaining on the books, expire them
// and rebuild the limit order set immediately using the sum total of funds
// used for all the limit orders that existed, starting with the price at the highest limit value
// using the rebuy config to create new orders
// NOTE: if you use this setting, it is recommended that you set it higher than
// the number of items in your CPBB_REBUY config so it doesn't excessively rebuild
// the same orders over and over
// NOTE: this feature only matters if you are using a non-zero CPBB_REBUY_CANCEL config
// NOTE: enabling this feature also sets new created_at timestamps for limit orders so the expiration is continuously pushed out until they are filled
CPBB_REBUY_REBUILD: 12
```

The above config will cause the engine to attempt to set $50 worth of limit orders for the asset after each `SELL` action. The orders will be placed as .0001 @ -2% drop, .0001 @ -4% drop, etc until the $50 spending threshold is met. If the remaining funds in the last order is too little to create an order (would create a size too low for the API to accept), those funds are added to the last valid order.

### Resell Configuration

Since `4.0.0`, resell is available. See configuration samples in `sample.btcusd.limit_only.config.js` and `run.mine.config.js` (for a single target that cancels if unfilled before the next action point).

> Use carefully! The point of this bot is to accumulate a position and to buy the dip. If you are always setting limit sell orders to swap your purchases at some micro-pump in price, you are missing out on the long-term game and just running a day trading bot.

The `REBUY` option undoes what seems like an erroneous short term sell (given high volatility). It removes the previously captured `Realized` cash gain when the rebuy is filled and it does not add to the Total Input because that accounting was already done the first time the buy was made. For `RESELL`, it's the same in reverse--undo an erroneous buy action giving high short-term volatility. So it should not clock `Realized` cash gains and instead remove the previously accounted funds from the `Total Input`. From that point, the target value for our APY calculation does not consider the previously added cash on the buy that we resold. However, if some time has passed between when the buy action filled and the limit resell fills, the APY still applies a gain expectation to the `Total Input` during the time that the funds were in the investment. This makes sense because we will be walking away with some extra bitcoin (or whatever the holding is) and will end up with a reduced cost-basis as a result of the buy + resell fulfilling.

### Volume and Frequency

The Coinbase API will only allow market taker orders of `$5` or more. So my original idea of buying $1 or $2 worth every hour (or even more frequently) went bust. Keep in mind when setting your VOL config that you should be able to feed the engine through a year-long bear market.

- $10/hour = $240/day = $1680/week = $87,600/year max buy.
- $10/(2 hours) = $120/day = $840/week = $43,800/year
  - `CPBB_FREQ='0 */2 * * *' node .`
- $10/(3 hours) = $80/day = $560/week = $29,120/year
  - `CPBB_FREQ='0 */3 * * *' node .`
- $10/(4 hours) = $60/day = $420/week = $21,900/year
  - `CPBB_FREQ='0 */4 * * *' node .`
- $10/(6 hours) = $40/day = $280/week = $14,600/year
  - `CPBB_FREQ='0 */6 * * *' node .`
- `DEFAULT` $10/(8 hours) = $30/day = $210/week = $10,950/year
  - `CPBB_FREQ='0 */8 * * *' node .`
- $10/(12 hours) = $20/day = $140/week = $7,300/year
  - `CPBB_FREQ='0 */12 * * *' node .`
- $10/day = $70/week = $3,650/year (runs at 1am every day)
  - `CPBB_FREQ='0 1 * * *' node .`
- etc...

If you want more crontab frequency options, you can construct your own via https://crontab.guru/

Additionally, could alter the dollar amount and act with `$15` twice a day (for example) like so:

```
CPBB_VOL=15 CPBB_FREQ='0 */12 * * *' node .
```

## Tests

The project comes with development tests that measure the output logs and mock market conditions:

```
npm i
npm test
```

### Test Code Coverage

```
open ./coverage/lcov-report/index.html
```

There are two ways to test your own configs:

### Using the Coinbase Sandbox API (legacy)

The sandbox API network isn't a great testing environment as it does not support many trading pairs and has fake liquidity and transactions. This path exists for legacy testing. This option also requires a different API key, and is probably more headache than it's worth for regular testing.

1. Create a Sandbox API account and API Keyset here: https://public.sandbox.coinbase.com/profile/api
2. You will also need to fake transfer USD from Coinbase into the Sandbox

Then run the app against the Sandbox API

```
export CPBB_APIKEY="SANDBOX API KEY"
export CPBB_APISEC="SANDBOX API SECRET"
CPBB_TEST=true node .
```

### Using CPBB_DRY_RUN feature

The real coinbase API can also be run in a "dry run" mode, which will calculate and record transactions into a special dry run history log as if actions were taken, even though no buy/sell orders are made against the API.

1. Edit the `./api.keys.js` file to have your APIKEY, and APISEC (or add them as environmental variables)
2. start pm2

```
pm2 start run.dry.all.minute.config.js
```

3. observe the logs: `pm2 logs`
4. Let it run for a few minutes
5. kill it: `pm2 stop run.dry.all.minute.config.js`
6. look at the log files: `./data/history.BTC-USD.dryrun.tsv` and `./data/history.LTC-BTC.dryrun.tsv`, etc

## History / Logs

This app is built to be entirely self-contained. There is no database or 3rd party (aside from Coinbase as the market source). Activity is logged to a tsv file in the local `./data` directory on disk.

Here is an example log from my first tests:

```
Time	Price	Holding	Value	Funds	Shares	PeriodRate	ExpectedGain	TotalInput	Target	Diff	EndValue	Realized	TotalValue	Liquid	Profit
2020-01-21T03:23:03.473Z	8656.29	0	0	10	0.00115292	0	0	10	10	-10	10	0	10	0	0
2020-01-21T03:24:03.473Z	8655.89	0.00115292	9.98	10	0.00115297	0.00000344	0	20	20	-10	19.98	0	19.98	-0.02	-0.10%
2020-01-21T03:25:03.473Z	8645.22	0.00230589	19.93	10	0.00115378	0.00000344	0	30	30	-10	29.93	0	29.93	-0.07	-0.22%
2020-01-21T03:26:02.704Z	8646.62	0.00345967	29.91	10	0.00115421	0.00000344	0	40	40	-10.02	39.91	0	39.91	-0.09	-0.12%
2020-01-21T03:27:02.162Z	8646.63	0.00461388	39.89	10	0.00115421	0.00000344	0	50	50	-10.04	49.89	0	49.89	-0.11	-0.15%
2020-01-21T03:28:02.535Z	8645.95	0.00576809	49.87	10	0.0011543	0.00000344	0	60	60	-10.07	59.87	0	59.87	-0.13	-0.16%
2020-01-21T03:29:01.562Z	8645.5	0.00692239	59.85	10	0.00115436	0.00000344	0	70	70	-10.09	69.85	0	69.85	-0.15	-0.18%
2020-01-21T03:30:02.972Z	8646.95	0.00807675	69.84	10	0.00115416	0.00000344	0	80	80	-10.1	79.84	0	79.84	-0.16	-0.17%
2020-01-21T03:31:03.212Z	8649.49	0.00923091	79.84	10	0.00115399	0.00000344	0	90	90	-10.1	89.84	0	89.84	-0.16	-0.15%
2020-01-21T03:32:02.504Z	8646.19	0.0103849	89.79	10	0.00115404	0.00000344	0	100	100	-10.15	99.79	0	99.79	-0.21	-0.18%
2020-01-21T03:33:02.693Z	8651.56	0.01153894	99.83	10	0.00115355	0.00000344	0	110	110	-10.12	109.83	0	109.83	-0.17	-0.13%
2020-01-21T04:35:02.496Z	8670	0.01269249	110.04	10	0.0011511	0.00001123	0	120	120	-9.96	120.04	0	120.04	0.04	0.04%
```

# Scripting Tools

There are many single run scripted tools in the `tools` directory of this project. Each file documents what it does and how to use it. here are a couple of interesting ones in more detail:

## Tax Calculator

NOTE: I am not an accountant. I am not a fiduciary. You are responsible for the accuracy of your own tax reporting and usage of this tool is not guaranteed to give you accurate results. I use it. It's for me. If you want to use it, you are responsible for reviewing the code and making sure it is accurate for your accounting needs/purposes.

### Calculate Short-term and Long-term and Capital Gains for a Calendar Year

```
CPBB_TICKER=BTC CPBB_CURRENCY=USD CPBB_YEAR=2020 node tax_fifo.js
```

## APY Adjuster

If you want to change your APY and back-edit all your history so your Target is adjusted to be that APY consistently for your whole history (this will compound). You can run like so:

```
# updates the BTC-USD history with 150% APY (creates a new ./data/history.BTC-USD.fixed.apy.tsv that will need to be reviewed and copied into your history.BTC-USD.tsv)
CPBB_TICKER=BTC CPBB_APY=150 node adjust.apy.js
# after copying into ./data/history.BTC-USD.tsv
pm2 reload all
```

## Adding Missing Records

I have noticed that in extreme situations, the Coinbase API will be so overloaded that the API will fail to complete an order and timeout. However, the order does complete. When I notice this, I can see in Coinbase that the order went through and get the price and shares traded--but the engine is still running without that info!

> NOTE: I believe we have addressed this in retry logic. If you see this happen, please file an issue.

To correct this, I've added a manual log entry tool. In order to use this, you will need to load your keys as env vars and then execute like the following:

```
# node addLog.js $TICKER $CURRENCY $VOLUME $APY $DATEISO $PRICE $SHARES
node addLog.js BTC USD 50 20 2020-11-26T16:35:00.706Z 16915.52 0.00295586
```

## Build Complete History from Coinbase Fills

If you want to add all manual activity to the history file, you can generate a new history file using all of the Coinbase data. This only looks at Coinbase so if you moved funds in and out of that service (even to Coinbase), there can be negative balances appearing in the Holdings section of the history. If you bought coins elsewhere and moved them into Coinbase, you will have possible sells that have no buy history associated with them.

```
cd tools;
CPBB_TICKER=BTC CPBB_CURRENCY=USD CPBB_APY=150 CPBB_SINCE=2015-01-01 node create.history.js
```

or to use a cached fills history file:

```
cd tools;
CPBB_TICKER=BTC CPBB_CURRENCY=USD CPBB_APY=150 CPBB_SINCE=2015-01-01 CPBB_FILLS=../data/fills_BTC-USD.json node create.history.js
```

# Disclaimer

This software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and non-infringement. In no event shall the authors, copyright holders, or Coinbase Inc. be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.

# Who Am I?

I'm a recent NYU grad and Microsoft Intern. I like to play with code as a way of exploring and proving economic theories.

I am not a financial advisor but you can find my occasional takes on twitter: https://twitter.com/cryptecon
