import logging
import sys

def get_logger(logger_name: str):
    """
    Creates a standardized professional logger.
    Replaces standard print() statements.
    """
    logger = logging.getLogger(logger_name)
    
    # Only add configuration if the logger is new
    if not logger.hasHandlers():
        logger.setLevel(logging.INFO)
        
        # Professional format: [Time] - [Module Name] - [Severity] - Message
        formatter = logging.Formatter(
            '[%(asctime)s] - [%(name)s] - [%(levelname)s] - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
        
    return logger