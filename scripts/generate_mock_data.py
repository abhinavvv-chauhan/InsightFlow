import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import uuid
import random
import os

def generate_mock_events(num_records=10000, output_file='data/raw/events.csv'):
    np.random.seed(42)
    random.seed(42)
    
    users = [f'user_{i}' for i in range(1, 1001)]
    devices = ['android', 'ios', 'desktop']
    browsers = ['chrome', 'safari', 'firefox', 'edge']
    cities = ['bangalore', 'mumbai', 'delhi', 'chennai', 'pune']
    countries = ['India']
    sources = ['google', 'meta', 'direct', 'organic']
    campaigns = ['summer_sale', 'win_back', '(none)']
    
    products = [f'prod_{i}' for i in range(1, 51)]
    categories = ['Electronics', 'Fashion', 'Home']
    
    start_date = datetime(2026, 7, 1)
    
    records = []
    
    for _ in range(num_records):
        user_id = random.choice(users)
        session_id = f'sess_{uuid.uuid4().hex[:8]}'
        
        # Determine sequence of events for this session
        num_events = random.choices([1, 2, 3, 4, 5, 6, 7], weights=[0.4, 0.2, 0.15, 0.1, 0.08, 0.05, 0.02])[0]
        base_time = start_date + timedelta(days=random.randint(0, 15), hours=random.randint(0, 23), minutes=random.randint(0, 59))
        
        device = random.choice(devices)
        browser = random.choice(browsers)
        city = random.choice(cities)
        country = 'India'
        source = random.choice(sources)
        campaign = random.choice(campaigns) if source != 'direct' else '(none)'
        
        event_types = ['page_view', 'search', 'product_view', 'add_to_cart', 'checkout', 'payment', 'purchase']
        
        for i in range(num_events):
            event_type = event_types[i]
            event_time = base_time + timedelta(minutes=i*2)
            
            product_id = random.choice(products) if event_type in ['product_view', 'add_to_cart', 'checkout', 'payment', 'purchase'] else None
            
            record = {
                'session_id': session_id,
                'user_id': user_id,
                'timestamp': event_time.strftime('%Y-%m-%dT%H:%M:%S+00:00'),
                'event_type': event_type,
                'device': device,
                'browser': browser,
                'city': city,
                'country': country,
                'traffic_source': source,
                'campaign': campaign,
            }
            
            if product_id:
                record['product_id'] = product_id
                record['product_name'] = f'Product {product_id}'
                record['category'] = random.choice(categories)
                record['sub_category'] = 'SubCat'
                record['unit_price'] = random.randint(100, 5000)
                
            if event_type in ['payment', 'purchase']:
                record['order_id'] = f'ord_{session_id}'
                record['order_amount'] = record.get('unit_price', 1000) * random.randint(1, 3)
                record['quantity'] = 1
                record['payment_method'] = random.choice(['UPI', 'Card', 'COD'])
                record['payment_status'] = random.choice(['success', 'failed'])
                # Only purchases should have successful payment theoretically, but let's simplify
                if event_type == 'purchase':
                    record['payment_status'] = 'success'
            
            records.append(record)
            
            # If payment fails, don't generate purchase
            if event_type == 'payment' and record['payment_status'] == 'failed':
                break

    df = pd.DataFrame(records)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    df.to_csv(output_file, index=False)
    print(f"Generated {len(df)} mock events at {output_file}")

if __name__ == "__main__":
    generate_mock_events()
