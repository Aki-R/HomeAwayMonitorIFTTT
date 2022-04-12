import glob
import json
import os
import pandas as pd
from apiclient.http import MediaFileUpload, MediaIoBaseDownload
from genericpath import exists
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError as HTTPError
import time
from pandas.tseries.offsets import DateOffset
import io

PATH_JSON = 'html/InHomeData.json'

SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets']

sa_creds = service_account.Credentials.from_service_account_file('homeawaymonitor_APIKey.json')
scoped_creds = sa_creds.with_scopes(SCOPES)
drive_service = build('drive', 'v3', credentials=scoped_creds)

# File ID on Google Drive: https://drive.google.com/drive/folders/xxxxxxxxxx <- Last part is the ID.
file_id = '1FBPeMmg002ePAHYNQzcyxxY6jYH2AAYPsSS0GPWFTHE'

request = drive_service.files().export_media(fileId=file_id, mimeType='text/csv')
fh = io.BytesIO()
downloader = MediaIoBaseDownload(fh, request)
done = False
while done is False:
    status, done = downloader.next_chunk()

df = pd.read_csv(io.StringIO(fh.getvalue().decode()),header=None, names=['DateTime', 'HomeAway'])
df['DateTime'] = pd.to_datetime(df['DateTime'])

df2 = pd.DataFrame(index=[], columns=['DateTime','InHome'])

for row in df.itertuples():
    if(row[2] == 'entered'):
        time_loc = row[1] + DateOffset(seconds=1)
        df_loc = pd.DataFrame({'DateTime': [row[1], time_loc],
                           'InHome': ['Away', 'Home']})
        df2 = pd.concat([df2,df_loc],ignore_index=True)
    if(row[2] == 'exited'):
        time_loc = row[1] + DateOffset(seconds=1)
        df_loc = pd.DataFrame({'DateTime': [row[1], time_loc],
                               'InHome': ['Home', 'Away']})
        df2 = pd.concat([df2, df_loc],ignore_index=True)

fileout = open(PATH_JSON, 'w')
print(df2.to_json(orient='records'), file=fileout)
fileout.close()