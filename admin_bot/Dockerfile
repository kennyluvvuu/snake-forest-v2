FROM python:3.12

WORKDIR /bot
# Dependencies
COPY requirements.txt ./
RUN pip install -r requirements.txt
# Build 
COPY . .
CMD [ "python", "main.py" ]