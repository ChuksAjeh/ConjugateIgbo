import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { ICON_IMAGE, WavePattern, SlantedBox } from './SplashScreen';
import { useTheme } from './ThemeProvider';


export default function StartPracticingScreen({
  onFinish,
}: {
  onFinish: () => void;
}) {
  const { theme, isDark } = useTheme();
  const styles = React.useMemo(
    () => createStyles(theme, isDark),
    [theme, isDark],
  );

  return (
    <View style={styles.container}>
      <View style={styles.waveLeft}>
        <WavePattern side="left" opacity={isDark ? 0.1 : 0.6} />
      </View>
      <View style={styles.waveRight}>
        <WavePattern side="right" opacity={isDark ? 0.1 : 0.6} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleContainer}>
            <SlantedBox type="conjugate">
              <Text style={styles.titleText}>LET&apos;S LEARN IGBO</Text>
            </SlantedBox>
          </View>

          <Image source={ICON_IMAGE} style={styles.logo} resizeMode="contain" />

          <View style={styles.contentContainer}>
            <Text style={styles.headerText}>Happy practising!</Text>

            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>
                  If you&apos;re having trouble with a verb, save and come back
                  later.
                </Text>
              </View>

              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>
                  Play sounds to help with pronunciation.
                </Text>
              </View>

              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>
                  Click on the book icon to learn more about the verb
                </Text>
              </View>

              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>Remember to have fun!</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={onFinish}>
            <Text style={styles.startButtonText}>Start practising!</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    waveLeft: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 40,
      zIndex: 1,
    },
    waveRight: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: 40,
      zIndex: 1,
    },
    safeArea: {
      flex: 1,
    },
    scrollContent: {
      alignItems: 'center',
      paddingVertical: 40,
      paddingHorizontal: 30,
    },
    titleContainer: {
      marginBottom: 40,
      marginTop: 20,
    },
    titleText: {
      fontFamily: 'AmaticSC-Bold',
      fontSize: 42,
      color: '#FFFFFF',
      paddingHorizontal: 20,
      textAlign: 'center',
    },
    logo: {
      width: 200,
      height: 200,
      marginBottom: 40,
    },
    contentContainer: {
      width: '100%',
      paddingHorizontal: 10,
      marginBottom: 50,
      alignItems: 'center',
    },
    headerText: {
      color: theme.colors.text,
      fontSize: 22,
      marginBottom: 25,
      fontFamily: 'Manjari-Bold',
      alignSelf: 'center',
      width: 280,
      textAlign: 'left',
    },
    tipsList: {
      width: 280,
    },
    tipItem: {
      flexDirection: 'row',
      marginBottom: 18,
      alignItems: 'flex-start',
    },
    tipBullet: {
      color: theme.colors.primary,
      fontSize: 18,
      width: 20,
      fontFamily: 'Manjari-Bold',
      marginTop: -2,
    },
    tipText: {
      color: theme.colors.text,
      fontSize: 18,
      lineHeight: 24,
      fontFamily: 'Manjari-Regular',
      flex: 1,
      opacity: 0.9,
    },
    startButton: {
      backgroundColor: theme.colors.primary,
      width: 280,
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 40,
    },
    startButtonText: {
      color: '#FFFFFF',
      fontSize: 20,
      fontFamily: 'Manjari-Bold',
    },
  });
