import { Box, Button, Center, Stack, Text } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";
import { useIngestionFormContext } from "../ingestion.form.context";

interface IDirectorySelectorProps {
    disabled: boolean;
    setDisabled: Dispatch<SetStateAction<boolean>>;
}

const DirectorySelector = (props: IDirectorySelectorProps) => {

    const form = useIngestionFormContext();

    const selectDirectory = async() => {
        const dir = await window.context.selectDirectory();

        if(dir) {
            form.setFieldValue('directoryPath', dir);
            props.setDisabled(false);
        }
    }
   
    return (
        <Box
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 30,
            }}
        >
            <Stack>
                <Center>
                    <Button mt={10} w={150} h={50} onClick={selectDirectory}>Select Folder</Button>
                </Center>
                {!props.disabled && <Text ta="center"><b>Selected folder:</b> {form.getValues().directoryPath}</Text>}
            </Stack>
        
        </Box>
    )
}

export default DirectorySelector;