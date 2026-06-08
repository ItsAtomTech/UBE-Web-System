import requests
import time
import logging
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

URL = "https://localhost:5002/notify_cron_service?token=e74af507f8a8bc087b378490e8d08895"
INTERVAL = 60

def ping():
    try:
        response = requests.get(URL, timeout=10, verify=False)
        logging.info(f"Response {response.status_code}")
    except requests.exceptions.ConnectionError:
        logging.error("Connection error — server may be down")
    except requests.exceptions.Timeout:
        logging.error("Request timed out")
    except requests.exceptions.RequestException as e:
        logging.error(f"Request failed: {e}")

if __name__ == "__main__":
    logging.info("Cron pinger started. Sending every 60 seconds...")
    while True:
        ping()
        time.sleep(INTERVAL)