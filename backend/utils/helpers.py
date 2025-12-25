import logging
import time
import uuid
from typing import Dict, Any, Optional
from datetime import datetime
import re


def setup_logging(log_level: str = "INFO"):
    """
    Set up logging configuration for the application.
    """
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler("app.log"),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)


def generate_request_id() -> str:
    """
    Generate a unique request ID for tracking requests.
    """
    return str(uuid.uuid4())


def validate_url(url: str) -> bool:
    """
    Validate if the given string is a properly formatted URL.
    """
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    return url_pattern.match(url) is not None


def sanitize_input(text: str) -> str:
    """
    Sanitize user input to prevent injection attacks.
    """
    if not text:
        return text

    # Remove potentially dangerous characters/sequences
    sanitized = text.replace('<script', '&lt;script').replace('javascript:', 'javascript&#58;')
    return sanitized.strip()


def measure_time(func):
    """
    Decorator to measure execution time of functions.
    """
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        execution_time = (end_time - start_time) * 1000  # Convert to milliseconds
        print(f"{func.__name__} executed in {execution_time:.2f} ms")
        return result
    return wrapper


def format_timestamp() -> str:
    """
    Format current timestamp in ISO 8601 format.
    """
    return datetime.utcnow().isoformat()


def calculate_similarity_score(text1: str, text2: str) -> float:
    """
    Calculate a basic similarity score between two texts.
    This is a simplified implementation - in production, use proper NLP techniques.
    """
    if not text1 or not text2:
        return 0.0

    # Simple word overlap similarity
    words1 = set(text1.lower().split())
    words2 = set(text2.lower().split())

    intersection = words1.intersection(words2)
    union = words1.union(words2)

    if not union:
        return 0.0

    return len(intersection) / len(union)


def truncate_text(text: str, max_length: int = 200) -> str:
    """
    Truncate text to a maximum length, adding ellipsis if truncated.
    """
    if len(text) <= max_length:
        return text
    return text[:max_length-3] + "..."


def validate_query_length(query: str, max_length: int = 1000) -> bool:
    """
    Validate that query length is within allowed limits.
    """
    return len(query) <= max_length


def validate_parameter_range(value: float, min_val: float, max_val: float) -> bool:
    """
    Validate that a parameter is within the specified range.
    """
    return min_val <= value <= max_val


def create_error_response(code: str, message: str, details: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Create a standardized error response.
    """
    error_response = {
        "success": False,
        "error": {
            "code": code,
            "message": message
        },
        "request_id": generate_request_id(),
        "timestamp": format_timestamp()
    }

    if details:
        error_response["error"]["details"] = details

    return error_response


def create_success_response(data: Any, request_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Create a standardized success response.
    """
    if request_id is None:
        request_id = generate_request_id()

    return {
        "success": True,
        "data": data,
        "request_id": request_id,
        "timestamp": format_timestamp()
    }