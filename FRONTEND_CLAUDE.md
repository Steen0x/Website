# CLAUDE.md — TradeNet Quantum Terminal (Frontend)

## Project Overview

TradeNet Quantum Terminal is a Rust-based cryptocurrency futures orderflow trading terminal built with the [Iced](https://github.com/iced-rs/iced) GUI framework. It provides real-time footprint charts, candlestick charts, liquidation heatmaps, orderbook heatmaps, DOM ladders, time & sales panels, and multi-exchange market data visualization. The terminal connects to Binance, Bybit, OKX, and Hyperliquid exchanges via WebSocket streams and REST APIs for live market data, and to a custom backend API for computed heatmap overlays.

## Tech Stack

- **Language:** Rust (2024 edition)
- **GUI Framework:** Iced 0.13+ (daemon mode, multi-window, canvas-based rendering)
- **Rendering:** Iced `canvas::Program` for all chart/panel rendering; GPU-accelerated via wgpu backend
- **Async Runtime:** Tokio (via Iced subscriptions and `reqwest`)
- **HTTP Client:** `reqwest` for REST API calls
- **WebSocket:** Custom TLS WebSocket connections in `exchange/src/connect.rs` (rustls + tungstenite)
- **Serialization:** `serde` + `serde_json` for config persistence and API response parsing
- **Key Dependencies:**
  - `iced` — GUI framework (widgets, canvas, subscriptions, multi-window)
  - `reqwest` — HTTP client for REST APIs
  - `tungstenite` — WebSocket protocol
  - `rustls` — TLS for WebSocket connections
  - `serde` / `serde_json` — Serialization/deserialization
  - `chrono` — Timestamp handling and UTC timezone
  - `enum_map` — Efficient enum-indexed maps for indicators
  - `rustc_hash` — Fast hash maps (FxHashMap) for trade data
  - `palette` — Color manipulation (HSV color picker)
  - `uuid` — Layout and pane identification
  - `log` + `env_logger` — Logging

## Architecture Overview

### Workspace Structure

The project is a Cargo workspace with three crates:

```
tradenet-terminal/          (root — binary crate, the GUI)
├── data/                   (library crate — data structures, config, aggregation logic)
│   └── src/
│       ├── lib.rs          — Data crate root, exports config paths, cleanup functions
│       ├── aggr/           — Trade aggregation (tick-based and time-based)
│       │   ├── ticks.rs    — TickAggr: aggregate N trades into one candle
│       │   └── time.rs     — TimeSeries: aggregate trades by time interval
│       ├── audio.rs        — Audio alert config types (SoundCache, StreamCfg, Threshold)
│       ├── chart/          — Chart data structures
│       │   ├── mod.rs      — Basis enum (Time/Tick), ViewConfig, Autoscale, PlotData
│       │   ├── comparison.rs — Comparison chart data types
│       │   ├── footprint_bar_stats.rs — FootprintBarStatsHistory, CandleStatsAccumulator, FootprintMetric
│       │   ├── heatmap.rs  — Heatmap data (HistoricalDepth, OrderRun, HeatmapDataPoint)
│       │   ├── indicator.rs — KlineIndicator/HeatmapIndicator enums, UiIndicator
│       │   └── kline.rs    — KlineDataPoint, KlineTrades, GroupedTrades, KlineChartKind, Config
│       ├── config/         — Configuration types
│       │   ├── sidebar.rs  — Sidebar state (Menu, Position)
│       │   ├── state.rs    — Application state config
│       │   ├── theme.rs    — Theme color helpers (darken, lighten, from_hsva)
│       │   └── timezone.rs — Timezone configuration
│       ├── layout/         — Layout persistence types
│       │   ├── mod.rs      — Window<T>, WindowSpec
│       │   ├── dashboard.rs — Dashboard serialization (pane tree + popout windows)
│       │   └── pane.rs     — Pane enum (KlineChart, HeatmapChart, TimeAndSales, etc.), Settings, VisualConfig
│       ├── log.rs          — Logging utilities
│       ├── panel/          — Panel configuration types
│       │   ├── ladder.rs   — DOM ladder config (GroupedDepth, ChaseTracker, TradeStore)
│       │   └── timeandsales.rs — Time & Sales config (TradeEntry, HistAgg, StackedBar)
│       ├── tickers_table.rs — Ticker table data (TickerRowData, TickerDisplayData, SortOptions)
│       └── util.rs         — Utility functions (abbr_large_numbers, round_to_tick, format_with_commas)
│
├── exchange/               (library crate — exchange adapters, fetchers, WebSocket connections)
│   └── src/
│       ├── lib.rs          — Exchange crate root, core types (Kline, Trade, Depth, OpenInterest, Ticker)
│       ├── adapter/        — Per-exchange implementations
│       │   ├── mod.rs      — Exchange enum (incl. Aggregated), StreamKind, fetch_ticker_info, fetch_ticker_prices, to_backend_symbol, BackendOiResponse
│       │   ├── binance.rs  — Binance adapter (REST + WS for spot, linear perps, inverse perps)
│       │   ├── bybit.rs    — Bybit adapter (REST + WS for spot, linear, inverse)
│       │   ├── okex.rs     — OKX adapter (REST + WS)
│       │   ├── hyperliquid.rs — Hyperliquid adapter (REST POST /info + WS)
│       │   └── aggr.rs     — Aggr-server WS adapter (multi-exchange aggregated trades)
│       ├── connect.rs      — TLS WebSocket connection setup
│       ├── depth.rs        — Depth/orderbook types
│       ├── fetcher.rs      — FetchRange, FetchRequests, RequestHandler (batched data fetching)
│       ├── limiter.rs      — Rate limiting for API requests
│       ├── ob_heatmap_fetcher.rs — Orderbook heatmap data fetching
│       └── util.rs         — Price, PriceStep types
│
└── src/                    (binary crate — the GUI application)
    ├── main.rs             — Application entry point (Flowsurface struct, Iced daemon)
    ├── agent_signals.rs    — AI agent signals data types and fetch function
    ├── auth/               — Authentication (Supabase-based login)
    │   ├── mod.rs          — Auth module root
    │   ├── db.rs           — Database/session persistence
    │   ├── supabase.rs     — Supabase client and credentials
    │   └── user.rs         — User types and session management
    ├── chart.rs            — Core chart module: ViewState, Interaction, drawing tools, Chart/PlotConstants traits
    ├── chart/
    │   ├── kline.rs        — KlineChart struct and rendering (candlesticks + footprint)
    │   ├── heatmap.rs      — Heatmap chart (trade heatmap with depth overlay)
    │   ├── heatmap_perf.rs — Heatmap performance metrics
    │   ├── heatmap_render.rs — Heatmap GPU rendering helpers
    │   ├── heatmap_texture.rs — Heatmap texture management
    │   ├── liq_heatmap.rs  — Liquidation heatmap overlay (API structs + rendering)
    │   ├── orderbook_heatmap.rs — Orderbook heatmap overlay (API structs + rendering)
    │   ├── footprint_bar_stats.rs — Footprint bar statistics panel rendering (9-row grid)
    │   ├── comparison.rs   — Comparison chart (multi-asset % change lines)
    │   ├── frame_pacing.rs — Frame pacing instrumentation overlay
    │   ├── ob_overlay.rs   — Order book overlay (binary protocol, bookmap coloring)
    │   ├── indicator.rs    — Indicator rendering infrastructure
    │   ├── indicator/
    │   │   ├── kline.rs    — KlineIndicatorImpl trait, factory function
    │   │   ├── kline/
    │   │   │   ├── open_interest.rs — OI indicator (line plot)
    │   │   │   └── volume.rs — Volume indicator (bar plot)
    │   │   └── plot.rs     — Series/Plot traits, ChartCanvas, PlotTooltip
    │   │       ├── bar.rs  — BarPlot (bar chart rendering)
    │   │       └── line.rs — LinePlot (line chart rendering)
    │   └── scale/
    │       ├── linear.rs   — Y-axis price scale, PriceInfoLabel
    │       └── timeseries.rs — X-axis time scale
    ├── layout.rs           — SavedState, layout persistence (load/save JSON config)
    ├── logger.rs           — Logging setup (env_logger)
    ├── modal.rs            — Modal container (layout manager, audio, theme editor)
    ├── modal/
    │   ├── audio.rs        — Audio alerts UI (threshold config, sound triggers)
    │   ├── layout_manager.rs — Layout manager UI (add, remove, rename, clone layouts)
    │   ├── theme_editor.rs — Theme color editor (HSV picker)
    │   └── pane/
    │       ├── mod.rs      — Modal enum (StreamModifier, Settings, Indicators, etc.)
    │       ├── indicators.rs — Indicator selection UI
    │       ├── mini_tickers_list.rs — Compact ticker search/select
    │       ├── settings.rs — Chart/panel settings views
    │       └── stream.rs   — Basis/timeframe/ticksize selector modal
    ├── screen.rs           — Screen module declarations
    ├── screen/
    │   ├── dashboard.rs    — Dashboard: pane grid management, data distribution, subscriptions
    │   ├── dashboard/
    │   │   ├── pane.rs     — Pane state management, content types (Kline, Heatmap, T&S, etc.)
    │   │   ├── panel.rs    — Panel trait (canvas-based side panels)
    │   │   ├── panel/
    │   │   │   ├── ladder.rs — DOM ladder rendering
    │   │   │   └── timeandsales.rs — Time & Sales rendering
    │   │   ├── sidebar.rs  — Sidebar navigation and tickers table container
    │   │   └── tickers_table.rs — Searchable/sortable ticker table with favorites
    │   ├── login.rs        — Animated login screen
    │   └── splash.rs       — Splash screen with typing animation
    ├── style.rs            — Styling constants, icon font, common style functions
    ├── theme.rs            — Theme setup, font loading, theme management
    ├── updater.rs          — Auto-updater logic
    ├── widget.rs           — Widget module declarations
    ├── widget/
    │   ├── chart.rs        — Chart zoom/domain utilities, Series trait
    │   ├── chart/comparison.rs — Line comparison widget (multi-asset overlay)
    │   ├── color_picker.rs — HSV color picker widget
    │   ├── column_drag.rs  — Draggable reorderable column widget
    │   ├── decorate.rs     — Widget decorator (custom layout/draw/update)
    │   ├── multi_split.rs  — Multi-panel vertical splitter
    │   └── toast.rs        — Toast notification system
    └── window.rs           — Window management utilities
```

### Main Entry Point (`src/main.rs`)

1. `main()` → sets up logging, loads fonts, spawns data cleanup thread
2. `iced::daemon(Flowsurface::new, Flowsurface::update, Flowsurface::view)` creates the application
3. `Flowsurface::new()` → loads `SavedState` from JSON config, initializes login screen or terminal
4. On login/enter → transitions `AppState::Login` → `AppState::Terminal`
5. Terminal state initializes: sidebar, layout manager, dashboard with pane grid
6. `subscription()` manages: exchange WebSocket streams, polling intervals, keyboard shortcuts

### Application State (`Flowsurface` struct in `main.rs`)

```
AppState::Login(LoginScreen) → animated login with exchange status
AppState::Terminal → full trading terminal with:
  - LayoutManager (Vec<Layout>, active layout UUID)
  - Dashboard per layout (pane_grid::State<pane::State>, popout windows)
  - Sidebar (tickers table, navigation)
  - AudioStream (trade alerts)
  - ThemeEditor (optional)
```

## Data Endpoints — Complete Reference

### Proxy Server (proxy.tradenet.org) — Exchange Data

All Binance REST traffic is proxied through `proxy.tradenet.org` to avoid CORS and rate limit issues.

| Endpoint | Base URL | Path | Parameters | Response Struct | Frequency |
|----------|----------|------|------------|-----------------|-----------|
| **Binance Spot Klines** | `https://proxy.tradenet.org/spot` | `/api/v3/klines` | `symbol, interval, limit, startTime?, endTime?` | `Vec<FetchedKlines>` | On demand |
| **Binance Linear Klines** | `https://proxy.tradenet.org/futures` | `/fapi/v1/klines` | `symbol, interval, limit, startTime?, endTime?` | `Vec<FetchedKlines>` | On demand |
| **Binance Inverse Klines** | `https://proxy.tradenet.org/inverse` | `/dapi/v1/klines` | `symbol, interval, limit, startTime?, endTime?` | `Vec<FetchedKlines>` | On demand |
| **Binance Spot Depth** | `https://proxy.tradenet.org/spot` | `/api/v3/depth` | `symbol, limit=1000` | `FetchedSpotDepth` | On demand |
| **Binance Linear Depth** | `https://proxy.tradenet.org/futures` | `/fapi/v1/depth` | `symbol, limit=1000` | `FetchedPerpDepth` | On demand |
| **Binance Spot ExchangeInfo** | `https://proxy.tradenet.org/spot` | `/api/v3/exchangeInfo` | None | `ExchangeInfo` | On startup |
| **Binance Linear ExchangeInfo** | `https://proxy.tradenet.org/futures` | `/fapi/v1/exchangeInfo` | None | `ExchangeInfo` | On startup |
| **Binance Spot 24hr Tickers** | `https://proxy.tradenet.org/spot` | `/api/v3/ticker/24hr` | None | `Vec<TickerStats>` | 13s (active) / 300s (inactive) |
| **Binance Linear 24hr Tickers** | `https://proxy.tradenet.org/futures` | `/fapi/v1/ticker/24hr` | None | `Vec<TickerStats>` | 13s / 300s |
| **Binance Linear OI** | `https://proxy.tradenet.org/futures` | `/fapi/v1/openInterest` | `symbol` | `{"openInterest": String}` | 15s (for bar stats) |
| **Binance Historical OI** | `https://proxy.tradenet.org/futures` | `/data/openInterestHist` | `symbol, period, startTime?, endTime?` | `Vec<DeOpenInterest>` | On demand |
| **Binance Historical Trades** | `https://data.binance.vision/` | Various CSV paths | None | CSV trade data | On demand |
| **Binance Spot AggTrades** | `https://proxy.tradenet.org/spot` | `/api/v3/aggTrades` | `symbol, limit=1000` | `Vec<Trade>` | On demand |
| **Binance Linear AggTrades** | `https://proxy.tradenet.org/futures` | `/fapi/v1/aggTrades` | `symbol, limit=1000` | `Vec<Trade>` | On demand |
| **Binance Funding Rate** | `https://proxy.tradenet.org/futures` | `/fapi/v1/premiumIndex` | `symbol` or `symbols=[]` | Funding rate data | On demand |

### Bybit API

| Endpoint | Base URL | Path | Parameters | Response Struct | Frequency |
|----------|----------|------|------------|-----------------|-----------|
| **Klines** | `https://api.bybit.com` | `/v5/market/kline` | `category, symbol, interval` | `Vec<Kline>` | On demand |
| **Instruments Info** | `https://api.bybit.com` | `/v5/market/instruments-info` | `category, limit=1000` | Instrument info | On startup |
| **24hr Tickers** | `https://api.bybit.com` | `/v5/market/tickers` | `category` | `HashMap<Ticker, TickerStats>` | 13s / 300s |
| **Historical OI** | `https://api.bybit.com` | `/v5/market/open-interest` | `category=linear, symbol, intervalTime` | `Vec<OpenInterest>` | On demand |

### OKX API

| Endpoint | Base URL | Path | Parameters | Response Struct | Frequency |
|----------|----------|------|------------|-----------------|-----------|
| **Instruments** | `https://www.okx.com` | `/api/v5/public/instruments` | `instType` | Instruments list | On startup |
| **24hr Tickers** | `https://www.okx.com` | `/api/v5/market/tickers` | `instType` | `HashMap<Ticker, TickerStats>` | 13s / 300s |
| **History Candles** | `https://www.okx.com` | `/api/v5/market/history-candles` | `instId, bar, limit, before?, after?` | `Vec<Kline>` | On demand |
| **Historical OI** | `https://www.okx.com` | `/api/v5/rubik/stat/...` | `instId, bar, begin?, end?` | `Vec<OpenInterest>` | On demand |

### Hyperliquid API

All Hyperliquid REST calls use `POST https://api.hyperliquid.xyz/info` with JSON body:

| Request Type | Body `type` field | Additional Fields | Response | Frequency |
|-------------|-------------------|-------------------|----------|-----------|
| **Orderbook** | `"l2Book"` | `coin` | Order book levels | On demand |
| **Metadata (Perps)** | `"meta"` | None | Asset metadata | On startup |
| **Metadata (Spot)** | `"spotMeta"` | None | Spot metadata | On startup |
| **Candles** | `"candleSnapshot"` | `req: {coin, interval, startTime, endTime}` | `Vec<Kline>` | On demand |
| **Ticker Prices** | `"metaAndAssetCtxs"` | None | `HashMap<Ticker, TickerStats>` | 13s / 300s |

### Backend API (api.tradenet.org:8899) — All Endpoints

Base URL: `http://api.tradenet.org:8899` (centralized as `BACKEND_API_BASE` in `exchange/src/lib.rs`, derived as `{BACKEND_API_BASE}/v2` in `liq_heatmap.rs:15` and `orderbook_heatmap.rs:22`)

The backend now uses clean primary paths. Old `/v1/`, `/v2/`, `/v3/` paths are kept as backwards-compatible aliases. Frontend currently uses `/v2/*` alias routes (hardcoded in `liq_heatmap.rs` and `orderbook_heatmap.rs`). Backend primary routes are the non-versioned paths shown in the table below. Both work identically. When the base URL is made configurable, new code should use clean paths without version prefixes.

All endpoints that accept a `symbol` parameter support `BTC`, `ETH`, and `SOL`. The backend accepts both short (`"BTC"`) and full (`"BTCUSDT"`) symbols — it strips the USDT suffix and uppercases internally via `_validate_symbol()`. Default symbol is `BTC` if omitted. Invalid symbols return 400 with a list of valid symbols. A valid symbol whose engine is still warming up returns 503.

| Primary Path | Alias(es) | Parameters | Symbols | Cache | Polling |
|-------------|-----------|------------|---------|-------|---------|
| `/health` | `/v1/health` | None | N/A | None | On demand |
| `/oi` | *(none)* | `symbol=BTC` | BTC, ETH, SOL | 5s | 15s poll |
| `/oi_history` | *(none)* | `symbol=BTC&from={ms}&to={ms}` | BTC, ETH, SOL | None | On demand |
| `/liq_heatmap` | `/v1/liq_heatmap` | `symbol=BTC` | BTC, ETH, SOL | 5s | 1s poll |
| `/liq_heatmap_history` | `/v1/liq_heatmap_history` | `symbol=BTC&minutes=720` | BTC, ETH, SOL | 30s | 10s poll |
| `/liq_heatmap_v2` | `/v2/liq_heatmap` | `symbol=BTC&min_notional=0` | BTC, ETH, SOL | 5s | 1s poll |
| `/liq_heatmap_v2_history` | `/v2/liq_heatmap_history` | `symbol=BTC&minutes=720&stride=1` | BTC, ETH, SOL | 30s | 10s poll |
| `/liq_stats` | `/v2/liq_stats` | `symbol=BTC` | BTC, ETH, SOL | 5s | On demand |
| `/liq_zones` | `/v3/liq_zones` | `symbol=BTC&side=&min_leverage=&max_leverage=&min_weight=` | BTC, ETH, SOL | 5s | On demand |
| `/liq_zones_summary` | `/v3/liq_zones_summary` | `symbol=BTC` | BTC, ETH, SOL | 5s | On demand |
| `/liq_zones_heatmap` | `/v3/liq_heatmap` | `symbol=BTC&min_notional=0&min_leverage=&max_leverage=&min_weight=` | BTC, ETH, SOL | 5s | On demand |
| `/orderbook_heatmap` | `/v2/orderbook_heatmap_30s` | `symbol=BTC` | BTC, ETH, SOL | 5s | 30s poll |
| `/orderbook_heatmap_history` | `/v2/orderbook_heatmap_30s_history` | `symbol=BTC&minutes=720&stride=1&range_pct=0.10` | BTC, ETH, SOL | 30s | 60s poll |
| `/orderbook_heatmap_stats` | `/v2/orderbook_heatmap_30s_stats` | None | BTC, ETH, SOL | 10s | On demand |
| `/orderbook_heatmap_debug` | `/v2/orderbook_heatmap_30s_debug` | None | BTC, ETH, SOL | 10s | On demand |
| `/liq_events` | *(none)* | `symbol=BTC&since_ts=0&limit=5000` | BTC, ETH, SOL | None | 5s poll |

**`/v3/liq_heatmap` is a legacy alias for the zones-based heatmap (`/liq_zones_heatmap`). It is NOT the same as `/liq_heatmap_v2` which serves the V2 intensity heatmap.**

**Orderbook endpoints now support all 3 symbols (BTC, ETH, SOL).** The `/orderbook_heatmap_stats` and `/orderbook_heatmap_debug` endpoints have no symbol parameter and return debug info for all engines.

### Aggr-Server (proxy.tradenet.org) — Multi-Exchange Aggregated Trades

| Endpoint | Full URL | Parameters | Response | Frequency |
|----------|----------|------------|----------|-----------|
| **Historical Trades** | `https://proxy.tradenet.org/aggr/trades/{symbol}/{from_ms}/{to_ms}` | Path: symbol (BTC/ETH/SOL), from_ms, to_ms (Unix ms) | `[[ts_ms, price, size, side, exchange], ...]` side: 0=buy, 1=sell | On demand |
| **Pre-Aggregated Footprint** | `https://proxy.tradenet.org/aggr/footprint/{symbol}/{from_ms}/{to_ms}/{timeframe_ms}` | Path: symbol (BTC/ETH/SOL), from_ms, to_ms (Unix ms), timeframe_ms (60000=1m, 900000=15m). Optional query: `?tick_size=5.0` (defaults: BTC=$5, ETH=$0.50, SOL=$0.05). Max range 12h. | `AggrFootprintResponse` — see below | On demand |

Max request range is 12 hours. Used for AGGREGATED ticker footprint backfill via `fetch_aggregated_footprint()` in `exchange/src/adapter.rs`.

| Endpoint | Full URL | Protocol | Frequency |
|----------|----------|----------|-----------|
| **Live Trades WS** | `wss://proxy.tradenet.org/aggr/ws` | Subscribe: `{"subscribe":"BTC"}` per symbol. Messages: `{"symbol":"BTC","trades":[[ts_ms, price, size, side, exchange], ...]}` | Continuous stream |

The aggr-server WebSocket provides multi-exchange aggregated live trades for AGGREGATED tickers. Trades flow through the same `insert_trades_buffer()` pipeline as exchange WS trades — identical behavior to Binance, just a different source URL. Adapter: `exchange/src/adapter/aggr.rs`. A single shared WS connection subscribes to all active AGGREGATED symbols. Trade format is identical to historical REST: `[ts_ms, price, size, side, exchange]` where side 0=buy, 1=sell. Parsed by `aggr::parse_trade_row()`.

### Aggr-Server Pre-Aggregated Footprint Response

**File:** `exchange/src/adapter.rs` (`AggrFootprintResponse`, `AggrFootprintCandle`)

Response:
```json
{
  "symbol": "BTC",
  "timeframe": 900000,
  "tick_size": 5.0,
  "candles": [
    {
      "ts": 1773290400000,
      "open": 69350.0,
      "high": 69520.0,
      "low": 69310.0,
      "close": 69480.0,
      "vol_buy": 145230.50,
      "vol_sell": 132870.25,
      "levels": [
        [69310.0, 2.31, 1.87, 45, 38],
        [69315.0, 1.05, 3.22, 22, 61]
      ]
    }
  ]
}
```

Per candle: `ts` (ms), `open/high/low/close` (can be null for current incomplete candle), `vol_buy/vol_sell` (USD notional from 4 exchanges). Per level: `[price, buy_vol, sell_vol, buy_count, sell_count]` where volumes are in base asset. Candles with null OHLC are the current incomplete candle — the frontend skips them (live WS owns the current candle).

### Agent Signals API (Render Backend)

| Endpoint | Full URL | Response Struct | Frequency |
|----------|----------|-----------------|-----------|
| **Dashboard** | `https://tradenet-quantum-terminal.onrender.com/api/dashboard` | `AgentSignalsData` | On demand (currently disabled) |
| **Chart Images** | `https://tradenet-quantum-terminal.onrender.com/api/charts/{coin}_{period}_{type}.png` | PNG image | On demand |

### WebSocket Connections

| Exchange | URL | Subscriptions | Module |
|----------|-----|---------------|--------|
| **Binance Spot** | `wss://proxy.tradenet.org/ws` | `{symbol}@depth@100ms`, `{symbol}@aggTrade`, `{symbol}@kline_{tf}` | `exchange/src/adapter/binance.rs` |
| **Binance Linear** | `wss://proxy.tradenet.org/ws-futures` | Same as spot | `exchange/src/adapter/binance.rs` |
| **Binance Inverse** | `wss://proxy.tradenet.org/ws-inverse` | Same as spot | `exchange/src/adapter/binance.rs` |
| **Bybit** | `wss://stream.bybit.com/v5/public/{market}` | `orderbook.{level}.{symbol}`, `publicTrade.{symbol}`, `kline.{tf}.{symbol}` | `exchange/src/adapter/bybit.rs` |
| **OKX** | `wss://ws.okx.com/ws/v5/{topic}` | `books` (depth), trades | `exchange/src/adapter/okex.rs` |
| **Hyperliquid** | `wss://api.hyperliquid.xyz/ws` | `{"method":"subscribe","subscription":{"type":"l2Book\|trades\|candle","coin":"{symbol}"}}` | `exchange/src/adapter/hyperliquid.rs` |
| **Aggr-Server** | `wss://proxy.tradenet.org/aggr/ws` | `{"subscribe":"BTC"}` per symbol | `exchange/src/adapter/aggr.rs` |

## API Response Formats — CRITICAL

### /v2/liq_heatmap?symbol=BTCUSDT

**File:** `src/chart/liq_heatmap.rs:48`

Response struct: `LiveSnapshot`
```json
{
  "symbol": "String",
  "price": "f64",
  "long_levels": [
    {
      "price": "f64",
      "price_low": "f64",
      "price_high": "f64",
      "notional_usd": "f64",
      "intensity": "f64",
      "bucket_count": "i32"
    }
  ],
  "short_levels": ["same structure as long_levels"]
}
```

### /v2/liq_heatmap_history?symbol=BTCUSDT&minutes=720

**File:** `src/chart/liq_heatmap.rs:58`

Response struct: `HistoryResponse`
```json
{
  "t": ["i64 array — timestamps in ms, one per frame"],
  "prices": ["f64 array — price grid levels"],
  "long": ["u8 array — flat [frames × prices] intensity for long liquidations"],
  "short": ["u8 array — flat [frames × prices] intensity for short liquidations"],
  "step": "f64 — price bucket size (e.g., 20.0)",
  "scale": "u8 — max intensity value (255)",
  "long_usd": ["f64 array — optional, raw USD values [frames × prices], #[serde(default)]"],
  "short_usd": ["f64 array — optional, raw USD values [frames × prices], #[serde(default)]"]
}
```

### /v2/orderbook_heatmap_30s?symbol=BTCUSDT

**File:** `src/chart/orderbook_heatmap.rs:47`

Response struct: `LiveSnapshot`
```json
{
  "symbol": "String",
  "ts": "f64 — timestamp",
  "src": "f64",
  "step": "f64 — price bucket size",
  "price_min": "f64",
  "price_max": "f64",
  "prices": ["f64 array — price grid"],
  "bid_u8": ["u8 array — bid intensity values"],
  "ask_u8": ["u8 array — ask intensity values"],
  "norm_p50": "f64 — 50th percentile normalization",
  "norm_p95": "f64 — 95th percentile normalization",
  "total_bid_notional": "f64",
  "total_ask_notional": "f64",
  "scale": "u8 — max intensity (255)"
}
```

### /v2/orderbook_heatmap_30s_history?symbol=BTCUSDT&minutes=720&stride=1&range_pct=0.10

**File:** `src/chart/orderbook_heatmap.rs:67`

Response struct: `HistoryResponse`
```json
{
  "t": ["i64 array — timestamps in ms"],
  "prices": ["f64 array — price grid levels"],
  "bid_u8": ["u8 array — flat [frames × prices] bid intensity"],
  "ask_u8": ["u8 array — flat [frames × prices] ask intensity"],
  "step": "f64 — price bucket size",
  "price_min": "f64",
  "price_max": "f64",
  "scale": "u8 — max intensity (255)",
  "norm_method": "String — normalization method used",
  "bid_btc": ["f64 array — optional, raw BTC values [frames × prices], #[serde(default)]"],
  "ask_btc": ["f64 array — optional, raw BTC values [frames × prices], #[serde(default)]"],
  "bid_usd": ["f64 array — optional, raw USD values [frames × prices], #[serde(default)]"],
  "ask_usd": ["f64 array — optional, raw USD values [frames × prices], #[serde(default)]"]
}
```

### /oi?symbol=BTC

**Consumed by frontend for AGGREGATED tickers.** Rust structs: `BackendOiResponse` and `BackendOiPerExchange` in `exchange/src/adapter.rs`. Fetched via `fetch_aggregated_oi(backend_symbol)`. The `aggregated_oi` value (contracts) is returned as `f32` and fed into the existing OI pipeline which multiplies by price to get USD.

Response:
```json
{
  "symbol": "BTC",
  "aggregated_oi": 123456.78,
  "per_exchange": {
    "binance": 45000.0,
    "bybit": 38000.0,
    "okx": 40456.78
  },
  "ts": 1708700000.123
}
```

Returns aggregated open interest from 3 exchanges (Binance, Bybit, OKX) with per-exchange breakdown. The `aggregated_oi` field is the sum of all exchanges. The `ts` field is a Unix timestamp (seconds with fractional ms).

### /oi_history?symbol=BTC&from={ms}&to={ms}

**File:** `exchange/src/adapter.rs` (`BackendOiHistoryResponse`)

Response struct: `BackendOiHistoryResponse`
```json
{
  "symbol": "BTC",
  "timestamps": [1708700000000, 1708700015000, 1708700030000],
  "oi": [123456.78, 123460.12, 123455.50],
  "ts_unit": "ms",
  "oi_unit": "base"
}
```

Returns 3-exchange aggregated OI history from an in-memory ring buffer (up to 24h depth, 15-second resolution). `timestamps` and `oi` are parallel arrays. OI values are in base asset (contracts), same unit as live `/oi` endpoint. The frontend converts to USD by multiplying by price in `update_oi_from_history()`. Used by AGGREGATED tickers for footprint bar stats historical OI (rows 5-6). Fetched via `fetch_aggregated_oi_history(backend_symbol, from_ms, to_ms)` in `exchange/src/adapter.rs`.

### /liq_events?symbol=BTC&since_ts=0&limit=5000

**File:** `exchange/src/adapter.rs` (`LiqEvent`, `LiqEventsResponse`)

Response struct: `LiqEventsResponse`
```json
{
  "symbol": "BTC",
  "events": [
    {
      "ts": 1708700000123,
      "side": "short",
      "price": 65432.10,
      "qty": 0.5,
      "notional_usd": 32716.05,
      "exchange": "binance"
    }
  ],
  "count": 42,
  "oldest_available_ts": 1708696400000,
  "newest_ts": 1708700000123,
  "ts_unit": "ms"
}
```

All fields except `events` are optional (`#[serde(default)]`). The `side` field is `"short"` or `"long"`. Timestamps are in milliseconds. The `since_ts` parameter is cursor-based — pass the `newest_ts` from the previous response to get only new events. Frontend polls every 5 seconds with `limit=5000`.

### Symbol Field in Responses

All backend API responses now include a `"symbol"` field at the top level confirming which symbol's data is being returned (e.g., `"symbol": "BTC"`). This applies to `/liq_heatmap_v2`, `/liq_stats`, `/orderbook_heatmap`, `/oi`, and all other per-symbol endpoints. When the frontend implements per-symbol routing (Phase 3), it should verify that the returned `"symbol"` matches what was requested to catch any routing bugs early.

### Backend API Error Handling

All backend error responses use JSON with a `"detail"` field containing a human-readable message. The frontend must handle these 4 error cases:

| HTTP Status | Cause | Example `detail` | Frontend Behavior |
|-------------|-------|-------------------|-------------------|
| **400** | Invalid symbol | `"Invalid symbol 'XRP'. Valid symbols: BTC, ETH, SOL"` | Show error message. Do not retry. |
| **400** | Invalid symbol for endpoint | `"Invalid symbol 'XRP'. Valid symbols: BTC, ETH, SOL"` | Show error message. Do not retry. |
| **503** | Data warming up | `"Data for ETH is warming up, please try again shortly."` | Retry after delay (e.g., 5-10s). Show loading/warming state in UI. |
| **404** | Endpoint not found | N/A | Check URL path for typos. Verify backend version. |

**Notes:**
- The frontend currently does not parse error responses from the backend. Phase 3 integration should add JSON error parsing to display `"detail"` messages to the user.
- The 503 warming-up state is transient — engines need a few seconds after startup to receive their first data from exchanges. Polling endpoints will self-recover.
- Orderbook endpoints now support all 3 symbols (BTC, ETH, SOL).

### Binance Kline Response

**File:** `exchange/src/adapter/binance.rs`

Response: Array of arrays (JSON tuple):
```json
[
  [
    1499040000000,  // Open time (u64 ms)
    "0.01634000",   // Open price (String → f32)
    "0.80000000",   // High price
    "0.01575800",   // Low price
    "0.01577100",   // Close price
    "148976.11427815", // Volume
    1499644799999,  // Close time
    "2434.19055334", // Quote asset volume
    308,            // Number of trades
    "1756.87402397", // Taker buy base asset volume
    "28.46694368",  // Taker buy quote asset volume
    "17928899.62484339" // Ignore
  ]
]
```

Deserialized into `exchange::Kline`:
```rust
pub struct Kline {
    pub time: u64,           // Open time ms
    pub open: Price,         // Open price
    pub high: Price,         // High price
    pub low: Price,          // Low price
    pub close: Price,        // Close price
    pub volume: (f32, f32),  // (buy_volume, sell_volume)
}
```

### Binance Trade (aggTrade) Response

```json
{
  "a": 26129,         // Aggregate trade ID
  "p": "0.01633102",  // Price
  "q": "4.70443515",  // Quantity
  "f": 27781,         // First trade ID
  "l": 27781,         // Last trade ID
  "T": 1498793709153, // Timestamp
  "m": true           // Is buyer maker (true = sell)
}
```

Deserialized into `exchange::Trade`:
```rust
pub struct Trade {
    pub time: u64,      // Timestamp ms
    pub is_sell: bool,   // true if taker sell
    pub price: Price,    // Trade price
    pub qty: f32,        // Trade quantity
}
```

## Data Flow Paths

### Path A: Kline/Candle Data → Rendered Candle

1. **Fetch:** `exchange/src/adapter/{exchange}.rs::fetch_klines()` → HTTP GET klines endpoint
2. **Deserialize:** Exchange-specific response → `Vec<exchange::Kline>`
3. **Store:** `dashboard.rs::distribute_fetched_data()` → `pane::State::insert_hist_klines()` → `KlineChart`
4. **Aggregate:** Into `PlotData<KlineDataPoint>` which is either:
   - `PlotData::TimeBased(TimeSeries)` — time-based aggregation
   - `PlotData::TickBased(TickAggr)` — trade-count aggregation
5. **Live updates:** WebSocket `kline` messages → `dashboard.rs::update_latest_klines()` → updates last candle in data source
6. **Render:** `KlineChart` implements `canvas::Program` → `draw()` reads `data_source`, uses `ViewState` (translation, scaling, cell_width) to convert timestamps to X coordinates and prices to Y coordinates, draws OHLC wicks and bodies
7. **Y-axis:** `scale/linear.rs` handles price-to-pixel mapping with autoscaling
8. **X-axis:** `scale/timeseries.rs` handles time-to-pixel mapping

### Path B: Footprint Data (Trade-Level → Footprint Cells)

1. **Trade fetch:** For Binance: `exchange/src/adapter/binance.rs::fetch_trades()` → `Vec<Trade>`. For Aggregated: `exchange/src/adapter.rs::fetch_aggregated_trades()` → `GET https://proxy.tradenet.org/aggr/trades/{symbol}/{from}/{to}` (max 12h). Live trades: WebSocket `aggTrade` stream (Binance-delegated for Aggregated tickers).
2. **Aggregation:** Trades flow into `KlineDataPoint.footprint: KlineTrades` which is `FxHashMap<Price, GroupedTrades>`
3. **Per-price bucketing:** `KlineTrades::add_trade_to_nearest_bin(trade, tick_step)` rounds trade price to nearest tick_step and accumulates:
   - `GroupedTrades.buy_qty` (if `!is_sell`)
   - `GroupedTrades.sell_qty` (if `is_sell`)
   - `buy_count`, `sell_count` for trade count
4. **Render:** `KlineChart` in `KlineChartKind::Footprint` mode draws each price level as a horizontal row within each candle column, with bid/ask volume bars or delta coloring based on `ClusterKind` (BidAsk, VolumeProfile, DeltaProfile)
5. **Scaling:** Controlled by `ClusterScaling` (VisibleRange, Hybrid, Datapoint)

#### AGGREGATED Footprint — Server-Side Aggregation

AGGREGATED panes use the pre-aggregated `/footprint` endpoint instead of client-side trade bucketing:

- **Historical footprint:** `GET /aggr/footprint/{symbol}/{from}/{to}/{timeframe}` returns complete candles with OHLCV (USD notional volumes) and per-price-level footprint bins. Response is authoritative for historical data within the 12h window. Fetched via `FetchRange::AggrFootprint` → `adapter::fetch_aggregated_footprint()`.

- **Live trades:** Still come from aggr-server WS (`wss://proxy.tradenet.org/aggr/ws`) via `insert_trades_buffer()`. The WS owns the current (incomplete) candle at the edge of the historical range.

- **Bar stats (rows 0-4):** Initialized from the `/footprint` response's `vol_buy`/`vol_sell` per candle (already USD). OI/Liq rows are unaffected.

- **Timeframe switch:** Creates a fresh empty TimeSeries and re-fetches from `/footprint` at the new timeframe (~300ms). No client-side rebuild from cached trades. `needs_kline_backfill` is set to fetch Binance klines for candles older than 12h.

- **Beyond 12h:** Binance kline backfill provides OHLC for older candles with no footprint (expected behavior). When the user's size unit is `Base`, Binance kline volumes are converted from base currency to USD (`volume * close_price`) at insertion time in `insert_hist_klines()`. When `Quote`, the Binance adapter already pre-converts to USDT so no further conversion is needed. This ensures all candles in the AGGREGATED timeseries have consistent USD `(buy, sell)` volumes matching the `/footprint` endpoint data, allowing `SizeUnit::Quote` to be used uniformly for bar stats initialization.

**Key difference from old approach:** The old 3-layer architecture (raw trade cache → rebuild_from_trades → render) is replaced by a single server call per timeframe. `rebuild_from_trades()` is no longer used for AGGREGATED historical data. The `raw_trades` cache is only used for live WS trade buffering, not historical rebuilds.

### Path C: Liquidation Heatmap → Rendered Overlay

1. **Polling:** `Flowsurface::subscription()` creates timers:
   - Live: every 1s → `Message::FetchLiqHeatmapLive`
   - History: every 10s → `Message::FetchLiqHeatmapHistory`
2. **Fetch:** `liq_heatmap::fetch_live()` → `GET {BACKEND_API_BASE}/v2/liq_heatmap?symbol={symbol}` → `LiveSnapshot`
3. **Fetch:** `liq_heatmap::fetch_history()` → `GET {BACKEND_API_BASE}/v2/liq_heatmap_history?symbol={symbol}&minutes=720` → `HistoryResponse`
4. **Store:** `KlineChart.liq_heatmap: LiquidityHeatmap` holds both `history: Option<HistoryResponse>` and `live: Option<LiveSnapshot>`
5. **Grid render:** History data is a flat u8 intensity array `[frames × prices]`. The renderer iterates frames (timestamps) and prices, maps intensity (0-255) to colors using a configurable theme (Vivid, Deep, Monochrome, Bookmap) and gamma curve
6. **Live overlay:** Live snapshot draws current liquidation pools as colored rectangles at price levels
7. **Filtering:** `liq_heatmap_min_notional` (default: $10,000 USD) filters out small levels

**Phase 3 (Tasks 22/25/26) DONE:** For AGGREGATED tickers, `Flowsurface::liq_heatmap_symbol()` in `main.rs` detects the active chart's exchange and uses `to_backend_symbol()` to convert the ticker (e.g., `BTCUSDT` → `BTC`) before passing it to the fetch URL. Non-aggregated tickers still default to `"BTC"`. All 3 symbols (BTC, ETH, SOL) return real per-symbol liquidation heatmap data from the backend.

### Path D: Orderbook Heatmap → Rendered Overlay

1. **Polling:** Subscription timers run whenever any pane has OB heatmap enabled:
   - Live: every 30s → `Message::FetchOrderbookHeatmapLive` (handler debounces via `should_poll_live()`)
   - History: every 60s → `Message::FetchOrderbookHeatmapHistory` (handler debounces via `should_poll_history()`)
   - **Immediate fetch:** When user toggles OB heatmap on, `needs_immediate_fetch` flag triggers an immediate fetch (bypasses timer). Symbol is extracted from the chart's active ticker.
2. **Fetch:** `orderbook_heatmap.rs::fetch_live()` → `GET {BACKEND_API_BASE}/v2/orderbook_heatmap_30s?symbol={symbol}` → `LiveSnapshot`
3. **Fetch:** `orderbook_heatmap.rs::fetch_history()` → `GET {BACKEND_API_BASE}/v2/orderbook_heatmap_30s_history?symbol={symbol}&minutes=720&stride=1&range_pct=0.10` → `HistoryResponse`
4. **Store:** `KlineChart.orderbook_heatmap: OrderbookHeatmap` holds history + live
5. **Grid render:** Same flat u8 intensity approach as liq heatmap, but with bid/ask sides. Rendering uses configurable theme and gamma. Supports binary frame protocol for efficient live updates
6. **Filtering:** `orderbook_heatmap_min_intensity` (default: 0, range 0-255) filters low-intensity cells

**Phase 3 DONE:** For AGGREGATED tickers, `Flowsurface::orderbook_heatmap_symbol()` in `main.rs` detects the active chart's exchange and uses `to_backend_symbol()` to convert the ticker (e.g., `ETHUSDT` → `ETH`). All 3 symbols (BTC, ETH, SOL) are fetched and rendered. The immediate fetch on toggle also resolves the correct symbol from the chart's active ticker.

### Path E: Footprint Bar Statistics Panel

**File:** `src/chart/footprint_bar_stats.rs` (rendering) + `data/src/chart/footprint_bar_stats.rs` (data)

9 metric rows displayed under the footprint chart, aligned with candle columns:

| Row | Metric | Calculation | Source |
|-----|--------|-------------|--------|
| 0 | **Volume** | `buy_vol_usd + sell_vol_usd` per candle | `/footprint` (historical) + `/bar_stats` server poll (live, AGGREGATED) or trades (live, single-exchange) |
| 1 | **Buy Vol** | Taker buy volume in USD per candle | Same as row 0 |
| 2 | **Sell Vol** | Taker sell volume in USD per candle | Same as row 0 |
| 3 | **Delta** | `buy_vol_usd - sell_vol_usd` per candle | Same as row 0 |
| 4 | **24H CVD** | Rolling 24-hour cumulative volume delta in USD. Server-authoritative for AGGREGATED (from `/bar_stats` poll for live candle, `/footprint` per-candle `cvd` field with offset anchoring for historical). Client-computed sliding window for single-exchange. | `/bar_stats` (live) + `/footprint` (historical) |
| 5 | **OI Delta** | `(oi_at_close - oi_at_open) × price` per candle. Uses `OiTimeseries.last_at_or_before()` for boundary lookups. | Backend `/oi_history` (historical) + `/oi` (live poll every 5s) |
| 6 | **OI CVD** | Server-computed cumulative OI delta since UTC midnight, in USD. | Backend `/oi` → `oi_cvd_utc` field (live poll every 5s) |
| 7 | **Short Liq** | Total USD value of short liquidations in the candle | Backend `/liq_events` (polled every 5s) |
| 8 | **Long Liq** | Total USD value of long liquidations in the candle | Backend `/liq_events` (polled every 5s) |

**Per-ticker shared data store (`TickerDataStore` in `data/src/chart/symbol_data.rs`):** OI readings and liq events are stored in timeframe-independent shared stores keyed by full ticker identity (e.g., `"Aggregated:BTCUSDT"`). Multiple panes viewing the same ticker at different timeframes share these stores. Fields: `oi: OiTimeseries`, `liq: LiqEventStore`, `footprint_start_ts`, `latest_price`, `oi_history_fetched`. Stored in `Flowsurface.ticker_stores: HashMap<String, TickerDataStore>` in `main.rs`.

**Data flow for AGGREGATED tickers (server-authoritative):**
1. **Chart load:** `/footprint` response provides historical candle volumes + per-candle `cvd` field + top-level `cvd_24h`. Historical CVD is computed via offset anchoring: `display_cvd[i] = (cvd_24h - last_candle.cvd) + candle[i].cvd`. Historical OI delta/CVD is computed from shared `oi_raw` via `recompute_oi_from_raw()`.
2. **Live bar stats (rows 0-4):** Polled every 250ms from `GET /bar_stats/{symbol}?timeframe={ms}` on the aggr-server. Response provides `vol_buy`, `vol_sell`, `delta`, `cvd_24h` for the current candle. Written directly to history arrays via `set_server_bar_stats()`. Aggr-WS trades still feed footprint levels and candle OHLC but do NOT accumulate into bar stat totals.
3. **Live OI (rows 5-6):** Polled every 5s from `GET /oi?symbol={symbol}` on the backend. `aggregated_oi` feeds the shared `oi_raw` store; `oi_cvd_utc` is written directly to the rightmost candle's OI CVD cell via `set_server_oi_cvd()`. OI Delta is client-computed from `oi_raw` boundary lookups via `update_current_oi_delta()`.
4. **Liq events (rows 7-8):** Polled every 5s from `GET /liq_events?symbol={symbol}`. Events stored in shared `TickerDataStore.liq`, bucketed into per-candle arrays.

**Data flow for single-exchange tickers (client-computed):**
1. **Chart load:** Klines provide historical volumes. `init_from_klines()` populates all history arrays.
2. **Live bar stats (rows 0-4):** Accumulated from WS trades via `process_trades()` → `CandleStatsAccumulator.add_trade()`.
3. **OI/Liq:** Not available for single-exchange tickers (rows 5-8 show NaN/zero).

### Path F: OI Indicator

1. **Check:** `OpenInterestIndicator::is_supported_exchange()` — Only perps (excludes HyperliquidLinear), `is_supported_timeframe()` — M5 to H4 (except H2)
2. **Fetch trigger:** `OpenInterestIndicator::fetch_range()` returns `FetchRange::OpenInterest(...)` when more data is needed
3. **Fetch:** Exchange-specific `fetch_historical_oi()`:
   - Binance: `GET /data/openInterestHist?symbol={}&period={}&startTime={}&endTime={}`
   - Bybit: `GET /v5/market/open-interest?category=linear&symbol={}&intervalTime={}`
   - OKX: `GET /api/v5/rubik/stat/...?instId={}&bar={}`
   - **Aggregated (live OI poll):** `GET {BACKEND_API_BASE}/oi?symbol={BTC|ETH|SOL}` via `fetch_aggregated_oi()` — returns sum of Binance+Bybit+OKX OI in contracts
   - **Aggregated (historical OI):** Uses backend `/oi_history?symbol={BTC|ETH|SOL}&from={ms}&to={ms}` via `fetch_aggregated_oi_history()` — returns 3-exchange aggregated OI from ring buffer (up to 24h, 15s resolution)
4. **Store:** `OpenInterestIndicator.data: BTreeMap<u64, f32>` — timestamp → OI value
5. **Render:** `LinePlot` draws OI as a line chart in its own indicator row below the main chart
6. **Live updates:** `on_open_interest(pairs)` updates data from WebSocket OI updates
7. **Aggregated routing (Phase 3):** In `main.rs`, `FetchFootprintBarStatsOI` handler checks `ticker.exchange == Exchange::Aggregated` — if so, calls `fetch_aggregated_oi(backend_symbol)` instead of `binance::fetch_current_oi()`. The symbol is converted via `to_backend_symbol()`.

## State Management

### Chart State (`ViewState` in `src/chart.rs:2361`)

- `translation: Vector` — Pan offset (x = time scroll, y = price scroll)
- `scaling: f32` — Zoom level
- `cell_width: f32` — Width of one candle/cell in world coordinates
- `cell_height: f32` — Height of one price level in world coordinates
- `basis: Basis` — `Time(Timeframe)` or `Tick(TickCount)`
- `bounds: Rectangle` — Current widget bounds
- `tick_size: PriceStep` — Minimum price increment
- `ticker_info: TickerInfo` — Current symbol info (exchange, market type, tick size)
- `layout: ViewConfig` — Split ratios and autoscale settings
- `active_tool: Tool` — Drawing tool (Cursor, Line, Box, Pencil, Text)
- `objects: Vec<DrawnObject>` — Drawn annotations (lines, boxes, pencil strokes, text)

### Settings Persistence

**Config file:** Loaded/saved via `data::read_from_file(SAVED_STATE_PATH)` / `data::write_to_file()`

`SavedState` (in `src/layout.rs:23`):
- `layout_manager` — All layouts with pane trees, pane content, visual configs
- `main_window` — Window position and size
- `scale_factor` — UI scale (0.5-3.0)
- `timezone` — UTC or Local
- `sidebar` — Sidebar position (Left/Right), active menu
- `theme` — Theme selection
- `custom_theme` — Custom theme colors (if any)
- `audio_cfg` — Audio alert configuration
- `volume_size_unit` — Base or Quote currency for sizes

**Persists between sessions:**
- All layout configurations (pane arrangements, selected tickers, timeframes, visual configs)
- Window position and size
- Sidebar state
- Theme settings
- Audio alert settings
- Volume display preference
- Favorited tickers

**Does NOT persist:**
- Live market data (klines, trades, depth)
- Heatmap data (re-fetched on startup)
- Drawing tool annotations (lines, boxes, text)
- Footprint bar statistics history (persists across panel toggle within a session, but not across app restarts)
- Scroll positions within panels
- Frame pacing overlay state

### Link Groups

Panes can be assigned to link groups (A through I). When a pane in a link group switches tickers, all other panes in the same group switch too. Managed via `LinkGroup` enum in `data/src/layout/pane.rs`.

## Footprint Bar Statistics — Calculation Reference

**Data file:** `data/src/chart/footprint_bar_stats.rs`
**Render file:** `src/chart/footprint_bar_stats.rs`

### Metric Calculations

- **Volume (AGGREGATED):** Server-provided from `/bar_stats` poll for live candle (250ms), `/footprint` for historical. All values in USD across 4 exchanges. For single-exchange: client-accumulated from trades.
- **Buy Vol / Sell Vol:** Same source as Volume — server-provided for AGGREGATED, client-accumulated for single-exchange.
- **Delta:** `buy_vol_usd - sell_vol_usd`. Server-provided for AGGREGATED live candle.
- **24H CVD (AGGREGATED):** Server-provided rolling 24H cumulative volume delta in USD. For the live candle: `cvd_24h` from `/bar_stats` poll. For historical candles: per-candle `cvd` from `/footprint` response, anchored to the top-level `cvd_24h` via offset computation (`display_cvd = (cvd_24h - last_candle.cvd) + candle.cvd`). For non-AGGREGATED: client-computed 24H sliding window from `candle_delta` array.
- **OI Delta:** `(oi_at_close - oi_at_open) × price` per candle. Uses `OiTimeseries.last_at_or_before()` for boundary-accurate lookups on the shared `TickerDataStore.oi` store. For historical candles, computed by `recompute_oi_from_raw()`. For the live candle, recomputed on each 5s OI poll via `update_current_oi_delta()` with fallback to live market price when close_prices has no entry.
- **OI CVD:** Server-provided from the `/oi` endpoint's `oi_cvd_utc` field — cumulative OI delta since UTC midnight, in USD. Written directly to the rightmost candle via `set_server_oi_cvd()`. For historical candles, computed by `recompute_oi_from_raw()` with UTC midnight resets. No client-side accumulator.
- **Short Liq:** Total USD value of short liquidations in the candle. Fed by `/liq_events` backend endpoint, polled every 5 seconds. Events stored in shared `TickerDataStore.liq` and bucketed into candle timestamps. Deduplicated via `(ts, exchange_hash, side, price_bits, notional_bits)` HashSet in main.rs.
- **Long Liq:** Same source as Short Liq — `/liq_events` polled every 5s with cursor-based pagination (`since_ts`).

### Color Coding

| Metric Group | Positive Color | Negative Color |
|-------------|---------------|----------------|
| Volume/Delta (rows 0-4) | Green gradient (pastel → bright) | Red gradient (pastel → bright) |
| OI metrics (rows 5-6) | Blue gradient (pastel → bright) | Purple gradient (pastel → bright) |
| Liquidations (rows 7-8) | 5-stop heat gradient: neutral → blue → green → yellow → orange | N/A (always positive) |

Intensity is normalized per-metric across the visible range, capped at `MAX_BG_INTENSITY = 0.55`.

### Known Discrepancies

1. **24H CVD** for AGGREGATED tickers is server-authoritative. The live candle's CVD comes from `/bar_stats` poll (250ms). Historical candles use per-candle `cvd` from `/footprint` response, offset-anchored to the server's `cvd_24h` total. Candles older than 12h (Binance-only kline data) have client-computed CVD from the `init_from_klines` sliding window, which uses Binance-only deltas and may differ from the 4-exchange aggregate.

2. **OI CVD** is server-provided via the `/oi` endpoint's `oi_cvd_utc` field (resets at UTC midnight, in USD). No client-side accumulator — the server is the single source of truth. Historical candle OI CVD is computed by `recompute_oi_from_raw()`.

3. **Liquidation rows** are populated via `/liq_events` polling (every 5s) for backend-supported symbols (BTC, ETH, SOL on Aggregated exchange). Non-aggregated tickers still show zeros as no per-exchange liq event feed exists.

4. **Bar stats polling for AGGREGATED (rows 0-4):** Uses `/bar_stats/{symbol}?timeframe={ms}` at 250ms. Maximum supported timeframe is 60 minutes (server ring buffer depth). For timeframes > 60m, only the most recent 60 minutes of the candle are included. Aggr-WS trades still feed footprint levels and candle OHLC rendering but do NOT accumulate into bar stat totals for AGGREGATED tickers.

4. **Timeframe switching:** When switching timeframes, `reset_for_timeframe(interval_ms)` clears per-candle arrays. Shared `TickerDataStore` (OI/liq raw data) persists across switches. After new kline/footprint data arrives, `recompute_oi_and_liq()` re-populates OI/liq rows from the shared store. The `/bar_stats` poll automatically starts sending the new timeframe parameter, providing correct volume/delta/CVD for the new candle width.

## Known Bugs and Issues

### Hardcoded Values That Should Be Configurable

1. **Backend API base URL** is centralized as `BACKEND_API_BASE` constant in `exchange/src/lib.rs`, currently set to `http://api.tradenet.org:8899`. All backend API calls (`liq_heatmap.rs`, `orderbook_heatmap.rs`, `adapter.rs`) derive their URLs from this constant via `format!("{}/v2", exchange::BACKEND_API_BASE)` or similar. To switch environments, change this single constant. Note: the `/v2/` paths still work as aliases on the backend.

2. **Liq heatmap history window** hardcoded to `minutes=720` (12 hours) in `liq_heatmap.rs:499`. Not user-configurable.

3. **OB heatmap history params** hardcoded: `minutes=720&stride=1&range_pct=0.10` in `orderbook_heatmap.rs:1075`. Not user-configurable. The `step` parameter is no longer sent — the backend auto-resolves the native step per symbol (BTC=20.0, ETH=1.0, SOL=0.10).

4. **Agent signals URL** hardcoded as `https://tradenet-quantum-terminal.onrender.com/api/dashboard`.

5. **Supabase credentials** are embedded directly in `src/auth/supabase.rs`.

### Potential Issues Found During Code Review

1. **Liquidation data NOW CONNECTED:** The footprint bar stats panel Short Liq and Long Liq rows are fed by the backend `/liq_events` endpoint, polled every 5 seconds for Aggregated tickers (BTC, ETH, SOL). Events are deduplicated, bucketed into candle timestamps, and distributed to matching panes. Per-symbol state (`LiqPollingState`) tracks cursor position (`last_seen_ts`) and dedup keys. Non-aggregated (single-exchange) tickers still show zeros as no per-exchange liq event feed exists.

2. **OI polling only works for Binance Linear:** The `FetchFootprintBarStatsOI` handler in `main.rs` fetches current OI, but the polling only targets one symbol at a time. If multiple panes show different symbols, OI might not update for all of them reliably. **Update (Phase 2b):** The backend `/oi` endpoint now returns aggregated OI from 3 exchanges (Binance, Bybit, OKX) for all 3 tracked symbols (BTC, ETH, SOL). **Update (Phase 3, Tasks 22/25/26):** AGGREGATED tickers now route live OI polling to the backend `/oi` endpoint via `fetch_aggregated_oi()`. Non-aggregated tickers still poll Binance directly. Historical OI for Aggregated tickers still delegates to Binance Linear (backend aggregated historical OI not yet available).

3. **Tick-based charts don't support some features:** Multiple methods call `unimplemented!()` for `Basis::Tick(_)`, including `visible_timerange()` in `KlineChart` (`src/chart/kline.rs`), `visible_timerange()` in `data/src/aggr/time.rs`, heatmap tick basis (`data/src/chart/heatmap.rs`), and comparison chart tick basis (`src/chart/comparison.rs`). These will panic if tick-based chart operations are attempted on those code paths.

4. **Agent signals feature is temporarily disabled:** The polling subscription is commented out in `subscription()` (line ~1900), but the message handlers and UI code still exist.

5. **`TEST_LIQUIDATION_GRADIENT` flag** in `footprint_bar_stats.rs:69` is `false` but exists in production code. Should ideally be `#[cfg(debug_assertions)]`.

5b. **`Threshold::Qty` audio alert variant** is not implemented — `src/modal/audio.rs:320` calls `unimplemented!()` for this variant. The `Threshold::Count` variant works properly.

6. **AGGREGATED footprint inflation on timeframe switch — FIXED.** Previously used client-side trade bucketing which was slow (~28s for 1h of BTC) and caused inflation on timeframe switches. Now uses server-side `/aggr/footprint` endpoint (~300ms) that returns pre-aggregated OHLCV + footprint data per timeframe. Client-side `rebuild_from_trades()` is no longer used for AGGREGATED historical data.

7. **AGGREGATED infinite trade fetch loop on higher timeframes — FIXED.** On 15m+ timeframes, `find_trade_gap()` would loop forever trying to fill old klines (covering days) with trades from the aggr-server (max 12h). Fixed by clamping the trade gap search to `now - 12h` for AGGREGATED panes in `missing_data_task()`. Additionally, `find_trade_gap_in_range()` now searches the visible viewport first before falling back to the full dataset, and `ViewportChanged` triggers an immediate fetch on pan/zoom release.

8. **AGGREGATED missing candle bodies after timeframe switch — FIXED.** Now uses server-side `/footprint` endpoint which returns complete OHLCV per candle. No client-side rebuild needed.

9. **AGGREGATED bar stats colors/values break on kline-only candles — FIXED.** Binance kline backfill volumes (base currency) were mixed with `/footprint` endpoint volumes (USD) in the same timeseries. Bar stats used `SizeUnit::Quote` uniformly, causing older kline-only candles to display raw base-currency quantities instead of USD. Fixed by converting Binance kline volumes to USD (`volume * close_price`) at insertion time in `insert_hist_klines()` for AGGREGATED panes, but only when `volume_size_unit() == Base` — when `Quote`, the Binance adapter already pre-converts to USDT. All candles now have consistent USD `(buy, sell)` volumes regardless of data source.

10. **AGGREGATED footprint crash on first load — FIXED.** Race condition between kline fetch and footprint fetch: `insert_aggregated_footprint()` replaced entire datapoints including kline OHLCV, causing data loss when fetches completed in different orders. Fixed by merging footprint data into existing datapoints (updating only footprint levels and volume, preserving OHLC). Also added `#[serde(default)]` to `AggrFootprintResponse.candles` to prevent JSON parse failures during server warmup. Volume stored as `(buy_vol, sell_vol)` matching the standard `Kline.volume` semantics (not `(buy, total)`).

11. **AGGREGATED tick size change caused footprint disappearance — FIXED.** `change_tick_size()` called `clear_trades()` which wiped all server-provided footprint data, then tried to rebuild from `raw_trades` (nearly empty for aggregated panes). Fixed by skipping `clear_trades()` for aggregated panes — only the tick_size is updated locally, and the server re-aggregates at the new tick size on re-fetch. The `?tick_size=` query parameter is now passed to the `/aggr/footprint` endpoint.

12. **OI Delta/CVD historical data missing — FIXED.** `update_oi_from_history()` in `data/src/chart/footprint_bar_stats.rs` used exact timestamp matching (`oi_map.get(&ts)`) to map OI readings to candle timestamps. OI data arrives at 5-minute boundaries minimum, but candle timestamps can differ by a few ms or be at a finer granularity (e.g., 1m). Fixed by replacing exact match with nearest-match via binary search: for each candle timestamp, finds the closest OI reading within one candle interval. On 1m charts, multiple candles may still show NaN between 5m OI readings (by design — OI data simply doesn't exist at 1m granularity).

13. **Bar stats toggle off→on wiped liq/OI data with no backfill — FIXED.** `set_footprint_bar_stats_enabled(true)` in `src/chart/kline.rs` called `init_footprint_bar_stats()` unconditionally, which cleared all accumulated liq events and OI history. Since the liq polling cursor had already advanced past historical data, the wiped data could never be re-fetched. Fixed by skipping re-initialization when `footprint_bar_stats.is_initialized()` is already true — data persists across panel toggle.

14. **Liq events cursor skipped unfinished backfill — FIXED.** In `FootprintBarStatsLiqFetched` handler in `main.rs`, the cursor always advanced to `newest_ts` from the response, even when the response contained exactly 5000 events (the limit). This meant if there were >5000 historical liq events, older ones were permanently skipped. Fixed by only advancing the cursor when `event_count < 5000`, allowing subsequent polls to continue draining the backlog.

15. **Bar stats OI/liq polling stopped when panel hidden — FIXED.** OI and liq polling subscriptions and their result distribution handlers all checked `chart.show_footprint_bar_stats`, which meant toggling the panel off stopped all data collection. When reopened, the data gap could not be backfill. Fixed by removing the `show_footprint_bar_stats` guard from polling subscriptions, fetch handlers, and result distributors — they now only check `is_initialized()`. Canvas invalidation is still gated on `show_footprint_bar_stats` to avoid unnecessary redraws when the panel is hidden.

16. **Bar stats never initialized after chart type switch (Candles→Footprint) — FIXED.** `set_content_and_streams()` created a new chart with `show_footprint_bar_stats: false` (hardcoded default) but never applied the pane's saved visual config. This meant the entire OI/liq pipeline never started. Fixed in two parts: (a) `set_content_and_streams()` now applies `self.settings.visual_config` after creating new content, and (b) `Event::SwitchChartType` returns `Effect::RefreshStreamsAndFetch` which triggers an immediate kline fetch (mirroring `init_focused_pane()`), eliminating the 1-2s dead time waiting for the tick cycle.

## NEVER DO — Code Rules

1. **NEVER** change the deserialization struct for a backend endpoint without confirming the backend actually sends that format — check the backend CLAUDE.md for response formats
2. **NEVER** replace a working renderer with a "fallback" — if the data pipe is broken, fix the pipe, not the renderer
3. **NEVER** add new fields to API response structs as required — always use `Option<T>` with `#[serde(default)]` so missing fields don't crash the parser
4. **NEVER** hardcode API base URLs — use the `BACKEND_API_BASE` constant in `exchange/src/lib.rs` (currently `http://api.tradenet.org:8899`)
5. **NEVER** compute CVD or OI CVD client-side for AGGREGATED tickers — these are server-authoritative values from `/bar_stats` (24H CVD) and `/oi` (OI CVD). Display what the server sends. For single-exchange tickers, client-side computation is still used.
6. **NEVER** break the existing heatmap grid renderer — it works correctly for V2 history rendering, only the data pipe to it should change
7. **NEVER** assume the backend response format matches what you expect — always check the actual response with a curl test first
8. **NEVER** create separate UI for aggregated tickers — they should appear in the existing screener with "AGGREGATED" as an exchange filter option
9. **NEVER** assume `Kline.volume` is `(buy, total)` — it is `(buy, sell)` across Binance REST, WS, and aggregated footprint. Bybit uses `(-1.0, total)` as a sentinel. The volume indicator computes total as `buy + sell`.

## Backend Coordination Reference

Backend repository: `moonstreamprocess`
Backend entry point: `poc/full_metrics_viewer.py` (runs engines + starts embedded API server)
Backend API: `poc/embedded_api.py` (the ONLY API server — `liq_api.py` is orphaned)
Backend API base: `http://api.tradenet.org:8899` (production, set via `BACKEND_API_BASE` in `exchange/src/lib.rs`)

The backend runs an EngineManager routing BTC, ETH, and SOL to independent engine instances. Each symbol has its own calibrator, heatmap, and zone manager. BTC additionally has orderbook engines. The backend connects to 3 exchanges for liquidation data: Binance, Bybit, OKX. Hyperliquid is excluded (no public liquidation stream). Raw exchange messages are normalized by `liq_normalizer.py` into a common format before reaching engines. The backend polls OI from 3 exchanges every 15 seconds and aggregates per symbol. All API endpoints read from live engine state via EngineManager. Response caching (5s live, 30s history, 10s stats) handles concurrent users. Backend accepts BOTH short (`"BTC"`) and full (`"BTCUSDT"`) symbols in API requests — `_validate_symbol()` strips the USDT suffix and uppercases internally. Tracked symbols: BTC, ETH, SOL. `VALID_SYMBOLS = {BTC, ETH, SOL}` is enforced across all endpoints.

**Phase 2b (Tasks 16-19) COMPLETE.** All 13 audit gaps resolved. Key changes:
- All API endpoints serve real per-symbol data — ETH and SOL return their own heatmaps, not BTC data.
- Per-symbol snapshot files written every minute via atomic writes: `liq_api_snapshot_BTC.json`, `liq_api_snapshot_v2_ETH.json`, etc.
- Per-symbol binary history buffers: `liq_heatmap_v1_BTC.bin`, `liq_heatmap_v2_ETH.bin`, etc.
- Per-symbol heatmap log files: `liq_tape_BTC.jsonl`, `liq_inference_ETH.jsonl`, etc.
- Legacy snapshot files (`liq_api_snapshot.json`, `liq_api_snapshot_v2.json`) are no longer written or read.
- Orderbook endpoints serve all 3 symbols (BTC, ETH, SOL).

Symbol conventions:
- Backend accepts both short and full symbols: `?symbol=BTC` or `?symbol=BTCUSDT`
- Exchange APIs and frontend use full symbols: `"BTCUSDT"`, `"ETHUSDT"`, `"SOLUSDT"`
- Backend calibrator uses short symbols internally: `"BTC"`, `"ETH"`, `"SOL"`
- Frontend should always send short symbols (`BTC`, `ETH`, `SOL`) when the selected exchange is `AGGREGATED`. For non-aggregated exchanges, the existing full ticker format (`BTCUSDT`) can continue to be used
- Invalid symbols return HTTP 400 with list of valid symbols in the `"detail"` field

**ANY change to backend response formats MUST be documented here and in the backend CLAUDE.md simultaneously.**

## Aggregation Architecture

**Backend aggregation is COMPLETE (Phase 2b — ETH/SOL engine parity COMPLETE):**
- 3 exchanges active: Binance, Bybit, OKX (Hyperliquid excluded — no public liquidation stream)
- 3 symbols tracked: BTC, ETH, SOL
- Liquidation events normalized (`liq_normalizer.py`) and routed to per-symbol engines
- OI aggregated from 3 exchanges via `/oi` endpoint (polled every 15s)
- All liq heatmap, liq zones, and orderbook heatmap endpoints are live and serving multi-exchange data
- All API endpoints serve real per-symbol data — ETH and SOL return their own heatmaps, not BTC data
- Per-symbol data verified: ETH V2 snapshot 16KB with 243 force orders and 51 inferences. SOL calibrator receiving real buy_vol, sell_vol, and oi_change
- Orderbook heatmap endpoints serve all 3 symbols (BTC, ETH, SOL)

**Frontend integration — Phase 3 (Tasks 22/25/26) PARTIALLY COMPLETE:**
- `Exchange::Aggregated` variant added to `Exchange` enum in `exchange/src/adapter.rs`
- `ExchangeInclusive::Aggregated` added — appears as "AGGREGATED" filter in screener tickers table
- 3 hardcoded tickers: `AGGREGATED:BTCUSDT`, `AGGREGATED:ETHUSDT`, `AGGREGATED:SOLUSDT` (returned by `aggregated_ticker_info()`)
- `to_backend_symbol(ticker_str) -> Option<&'static str>` in `exchange/src/adapter.rs` — single source of truth for mapping exchange tickers (e.g., `"BTCUSDT"`) to backend short symbols (`"BTC"`)
- **Trade data (depth + kline WS):** Aggregated delegates to Binance Linear WebSocket streams for depth updates and kline OHLC data (ticker remapped in `depth_subscription()` and `kline_subscription()` in `dashboard.rs`).
- **Trade data (live trades):** Aggr-server WebSocket (`wss://proxy.tradenet.org/aggr/ws`) provides multi-exchange aggregated live trades. Adapter: `exchange/src/adapter/aggr.rs`. Single shared WS connection subscribes to all active AGGREGATED symbols. Trades are routed through the same `insert_trades_buffer()` path as Binance WS trades — identical pipeline, different source. Binance WS trades are skipped entirely for AGGREGATED KlineChart panes in `update_depth_and_trades()` (depth still processed).
- **Trade data (historical footprint):** Aggregated uses `fetch_aggregated_footprint()` → `GET https://proxy.tradenet.org/aggr/footprint/{symbol}/{from}/{to}/{timeframe}` for pre-aggregated footprint + OHLCV data. Returns candles with USD notional volumes and per-price-level footprint bins. Max 12h range; older candles show no footprint. The old `fetch_aggregated_trades()` REST endpoint is kept as a fallback but no longer called by the frontend for AGGREGATED footprint.
- Kline data: Aggregated delegates to Binance Linear `fetch_klines()` (ticker remapped in `adapter.rs`)
- Ticker prices: Aggregated delegates to Binance Linear `fetch_ticker_prices()`, filtered to BTC/ETH/SOL only
- **OI (live poll):** Aggregated tickers route to `fetch_aggregated_oi()` → backend `/oi?symbol={BTC|ETH|SOL}` — returns sum of 3 exchanges in contracts
- **OI (historical):** Aggregated uses backend `/oi_history` endpoint for 3-exchange aggregated OI history (up to 24h, 15s resolution) via `fetch_aggregated_oi_history()`. Non-aggregated tickers still use per-exchange `fetch_historical_oi()`.
- **Liq heatmap:** `liq_heatmap_symbol()` helper in `main.rs` detects Aggregated exchange and converts ticker via `to_backend_symbol()` for fetch URL
- **Orderbook heatmap:** `orderbook_heatmap_symbol()` helper in `main.rs` detects Aggregated exchange and converts ticker via `to_backend_symbol()` for fetch URL. All 3 symbols (BTC, ETH, SOL) are fetched.
- **Liq events (bar stats rows 7-8):** Polling subscription fetches `/liq_events?symbol={BTC|ETH|SOL}&since_ts={cursor}&limit=5000` for Aggregated tickers. Uses 500ms rapid polling during initial backfill (when previous batch returned 5000 events), then 5-second steady-state. Per-symbol `LiqPollingState` in `main.rs` tracks `last_seen_ts` cursor, dedup HashSet, `catching_up` flag, and `last_oldest_candle_ts` for backward expansion detection. When the visible range expands backward (scroll/zoom/new klines), the cursor resets to the new oldest candle so older candles get liq data. Events are bucketed into candle timestamps via `add_liq_events()` and distributed to matching panes. Non-aggregated tickers do not poll liq events.
- Single exchange tickers continue using current data sources unchanged

**Phase 3 — COMPLETE.** All aggregated data paths now use multi-exchange sources. Historical OI uses backend `/oi_history` (3-exchange aggregated, up to 24h). No remaining Phase 3 tasks.

## Build & Run

```bash
# Development build
cargo run

# Release build
cargo build --release

# Run with debug logging
RUST_LOG=debug cargo run
```

The application requires the backend API (`api.tradenet.org:8899`) to be reachable for heatmap overlays. Without it, heatmap features will show errors but the rest of the terminal works normally.
