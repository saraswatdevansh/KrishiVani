from fastapi import APIRouter, Query
from typing import Optional, List, Dict, Any
from ..services.market import get_mandi_prices, get_all_market_listings

router = APIRouter(prefix="/api/market-prices", tags=["Market Prices"])

@router.get("")
async def fetch_market_prices(
    commodity: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None)
):
    if commodity:
        price_data = await get_mandi_prices(commodity, state=state, district=district)
        return [price_data]
    else:
        all_listings = await get_all_market_listings(state=state)
        return all_listings
