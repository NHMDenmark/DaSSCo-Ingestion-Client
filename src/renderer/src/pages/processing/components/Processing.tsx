import { Button, Center, Progress, Stack, Text } from "@mantine/core"
import { useIngestionFormContext } from "../ingestion.form.context";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { IpcRendererEvent } from "electron";
import { KeycloakService } from "@renderer/services/KeycloakService";
import { APIService } from "@renderer/services/APIService";

interface IProcessingProps {
    processing: boolean;
    setProcessing: Dispatch<SetStateAction<boolean>>;
    completed: boolean;
    setCompleted: Dispatch<SetStateAction<boolean>>;
    onCompletedCallback: any;
}

const Processing = (props: IProcessingProps) : JSX.Element => {
    const form = useIngestionFormContext();
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const startProcess = async() => {

        try {
            KeycloakService.refreshToken(async() => {
                props.setProcessing(true);
                await window.context.uploadFiles(form.getValues().directoryPath, KeycloakService.getToken() as string, {
                    ...form.getValues()
                });
            });

        } catch(err) {
            console.log(err);
        }
    }

    const handleUploadProgress = (_: IpcRendererEvent, { percentage }: { percentage: string }) => {
        setUploadProgress(parseInt(percentage));
    };

    const handleUploadCompleted = (event: IpcRendererEvent, folderName: string) => {
        APIService.sendFolderName(folderName);
        props.setProcessing(false);
        props.setCompleted(true);
        event.sender.removeAllListeners('upload-completed');
        event.sender.removeAllListeners('upload-progress');
        event.sender.removeAllListeners('upload-error');
    }

    const onCompleted = () => {
        props.onCompletedCallback();
    }

    useEffect(() => {
        window.context.onUploadProgress(handleUploadProgress);
        window.context.onUploadCompleted(handleUploadCompleted);
    }, []);

    return (
        <div>
            {!props.processing && !props.completed &&
                <Center>
                    <Button mt={40} mb={20} onClick={startProcess}>Start Upload</Button>
                </Center>
            }

            {
                props.processing &&
                <>
                    <Progress mt={80} value={uploadProgress} striped animated/>
                        <Center>
                            <Text mt={5}>{uploadProgress + "%"}</Text>
                        </Center>
                </>  
            }

            {
                props.completed &&
                <Center mt={30}>
                    <Stack>
                        <Text>Upload Completed</Text>
                        <Button onClick={onCompleted}>Completed</Button>
                    </Stack>
                </Center>
            }
       
            
        </div>
    )
}

export default Processing;