@@ .. @@
-        <View style={styles.progressContainer}>
-          <Text style={styles.progressText}>
-            {currentCardIndex + 1} of {totalCards}
-          </Text>
-          <View style={styles.dotsContainer}>
-            {Array.from({ length: totalCards }, (_, index) => (
-              <View
-                key={index}
-                style={[
-                  styles.dot,
-                  index === currentCardIndex && styles.activeDot
-                ]}
-              />
-            ))}
-          </View>
-        </View>
-
         <Text style={styles.instructionText}>
@@ .. @@
     card: {
       backgroundColor: theme.colors.surface,
       borderRadius: 20,
-      padding: 32,
+      padding: 24,
       width: width - 40,
       maxWidth: 380,
-      justifyContent: 'center',
       alignItems: 'center',
-      minHeight: 480,
+      height: 480,
       shadowColor: '#000',
       shadowOffset: {
         width: 0,
         height: 4,
       },
       shadowOpacity: 0.1,
       shadowRadius: 12,
       elevation: 8,
     },
     cardTitle: {
       fontSize: 20,
       fontWeight: '600',
       color: theme.colors.text,
-      marginBottom: 24,
+      marginBottom: 20,
+      marginTop: 16,
       textAlign: 'center',
       fontFamily: 'Inter-SemiBold',
     },
     verbContainer: {
+      flex: 1,
       width: '100%',
-      gap: 16,
-      paddingVertical: 16,
+      justifyContent: 'space-evenly',
+      paddingVertical: 8,
     },
     verbButton: {
-      paddingVertical: 12,
+      paddingVertical: 8,
       alignItems: 'center',
       justifyContent: 'center',
+      minHeight: 60,
     },
     verbButtonRevealed: {
       // No additional styling needed
     },
     igboText: {
-      fontSize: 32,
+      fontSize: 28,
       fontWeight: '700',
       color: theme.colors.text,
       textAlign: 'center',
-      marginBottom: 6,
+      marginBottom: 4,
       fontFamily: 'Inter-Bold',
     },
     pronunciationText: {
-      fontSize: 14,
+      fontSize: 12,
       color: theme.colors.textSecondary,
       textAlign: 'center',
       fontStyle: 'italic',
-      marginBottom: 6,
+      marginBottom: 4,
       fontFamily: 'Inter-Regular',
     },
     englishText: {
-      fontSize: 18,
+      fontSize: 16,
       color: theme.colors.textSecondary,
       textAlign: 'center',
       fontFamily: 'Inter-Regular',
     },
@@ .. @@
     instructionText: {
       fontSize: 14,
       color: theme.colors.textSecondary,
       textAlign: 'center',
-      marginTop: 32,
+      marginTop: 24,
       paddingHorizontal: 20,
       fontFamily: 'Inter-Regular',
     },
@@ .. @@
       fontFamily: 'Inter-SemiBold',
     },
-    progressContainer: {
-      alignItems: 'center',
-      marginTop: 32,
-      marginBottom: 16,
-    },
-    progressText: {
-      fontSize: 16,
-      color: theme.colors.textSecondary,
-      fontFamily: 'Inter-SemiBold',
-      marginBottom: 16,
-    },
-    dotsContainer: {
-      flexDirection: 'row',
-      gap: 8,
-    },
-    dot: {
-      width: 8,
-      height: 8,
-      borderRadius: 4,
-      backgroundColor: theme.colors.border,
-    },
-    activeDot: {
-      backgroundColor: theme.colors.primary,
-    },
   });
 
   if (currentCardIndex >= rhymeCards.length) {