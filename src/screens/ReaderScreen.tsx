import React, { useState, useEffect } from 'react';
import { SafeAreaView, useWindowDimensions, Button, Alert, View, Text } from 'react-native';
import { Reader, ReaderProvider } from '@epubjs-react-native/core';
import { useFileSystem } from '@epubjs-react-native/file-system'; // For bare RN projects
import * as ScopedStorage from 'react-native-scoped-storage';
import { ProgressBar } from 'react-native-paper';

const ReaderScreen = () => {
  const { width, height } = useWindowDimensions();
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Loading state

  // Request access to the Downloads folder and check if the file exists
  const requestPermission = async () => {
    setLoading(true); // Set loading to true when requesting permission
    try {
      let dir = await ScopedStorage.openDocumentTree(true); // User selects the directory
      if (!dir) {
        throw new Error("Directory access was denied");
      }

      const files = await ScopedStorage.listFiles(dir.uri);
      const epubFile = files.find(file => file.name === 'book1.epub');

      if (!epubFile) {
        throw new Error("The EPUB file 'book1.epub' was not found in the selected directory.");
      }

      setFileUri(epubFile.uri);
      console.log('File found:', epubFile.uri);
    } catch (err) {
      Alert.alert('Error', 'Error accessing the folder or loading the file');
      console.error('Error accessing the folder or loading the file:', err);
      setLoading(false); // Stop loading in case of error
    }
  };

  useEffect(() => {
    // Automatically request permission when the component mounts
    requestPermission();
  }, []);

  useEffect(() => {
    // If the fileUri is found, we are ready to load the book, so stop showing the loader
    if (fileUri) {
      setLoading(false);
    }
  }, [fileUri]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Show loader while loading is true */}
      {loading && (
        <View style={{ padding: 20 }}>
          <ProgressBar indeterminate color="blue" style={{ height: 10 }} />
          <Text style={{ marginTop: 10 }}>Loading...</Text>
        </View>
      )}

      {/* Display the reader only when loading is false and fileUri is available */}
      {!loading && fileUri && (
        <ReaderProvider>
          <Reader
            src={fileUri}
            width={width}
            height={height}
            fileSystem={useFileSystem}
            onReady={() => {
              console.log('Book ready');
            }}
            onLocationChange={(location) => console.log('Current Location:', location)}
            onDisplayError={(error) => {
              console.error('Error loading the EPUB:', error);
              Alert.alert('Error', 'There was an issue loading the EPUB file.');
            }}
          />
        </ReaderProvider>
      )}

      {/* If there's no fileUri and loading is false, show option to request permission */}
      {!fileUri && !loading && (
        <View style={{ padding: 20 }}>
          <Text>No EPUB file available. Please request permission again.</Text>
          <Button title="Request Permission" onPress={requestPermission} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default ReaderScreen;