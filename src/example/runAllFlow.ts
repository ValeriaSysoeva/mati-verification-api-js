import fs from 'fs';

import './config';
import apiService from '../apiService';
import SendInputRequest, {
  DocumentPhotoInputData,
  DocumentTypeTypes, Input,
  InputTypeTypes,
  MediaTypeTypes,
  PageTypes,
} from '../models/v2/SendInputRequest';
import SendInputResponse from '../models/v2/SendInputResponse';

const clientId = process.env.CLIENT_ID || 'default';
const clientSecret = process.env.CLIENT_SECRET || 'default';

async function main() {
  try {
    apiService.init({ clientId, clientSecret, host: 'http://localhost:4002' });
    await apiService.auth();
    const identityResource = await apiService.createIdentity();
    const { _id: id } = identityResource;
    enum FileNames {
      Front = 'front.jpeg',
      Back = 'back.jpeg',
      Video = 'video.mp4',
    }
    const sendInputRequest: SendInputRequest = {
      inputs: [
        <Input<DocumentPhotoInputData>>{
          inputType: InputTypeTypes.DocumentPhoto,
          group: 0,
          data: {
            type: DocumentTypeTypes.NationalId,
            country: 'US',
            region: 'IL',
            page: PageTypes.Front,
            filename: FileNames.Front,
          },
        },
        <Input<DocumentPhotoInputData>>{
          inputType: InputTypeTypes.DocumentPhoto,
          group: 0,
          data: {
            type: DocumentTypeTypes.NationalId,
            country: 'US',
            region: 'IL',
            page: PageTypes.Back,
            filename: FileNames.Back,
          },
        },
      ],
      files: [
        {
          mediaType: MediaTypeTypes.Document,
          fileName: FileNames.Front,
          stream: fs.createReadStream(`./assets/${FileNames.Front}`),
        },
        {
          mediaType: MediaTypeTypes.Document,
          fileName: FileNames.Back,
          stream: fs.createReadStream(`./assets/${FileNames.Back}`),
        },
        {
          mediaType: MediaTypeTypes.Video,
          fileName: FileNames.Video,
          stream: fs.createReadStream(`./assets/${FileNames.Video}`),
        },
      ],
    };
    const sendInputResponse: SendInputResponse = await apiService.sendInput(id, sendInputRequest);
    console.log('sendInputResponse', sendInputResponse);
    console.log('all flow done');
  } catch (err) {
    console.error(err);
  }
}


main()
  .then();
