import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  Image,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassButton, LoadingSpinner } from '../../src/components/common';
import { PostCard } from '../../src/components/post/PostCard';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../src/constants/theme';
import { groupService, Group } from '../../src/services/group.service';
import { postService, Post } from '../../src/services/post.service';
import { shareService } from '../../src/services/share.service';
import { useAuthStore } from '../../src/store/authStore';
import { useRequirePremium } from '../../src/hooks/usePremium';
import { getCountryName } from '../../src/constants/countries';

type SortKey = 'newest' | 'popular' | 'oldest';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'popular', label: 'Most liked' },
  { key: 'oldest', label: 'Oldest' },
];

const REPORT_REASONS: { key: string; label: string }[] = [
  { key: 'spam', label: 'Spam' },
  { key: 'harassment', label: 'Harassment' },
  { key: 'inappropriate', label: 'Inappropriate' },
  { key: 'misleading', label: 'Misleading' },
];

export default function GroupDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuthStore();
  const { requirePremium } = useRequirePremium();

  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [justJoined, setJustJoined] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>('newest');

  // Redesigned overlays (replace native Alert menus)
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [sortAnchor, setSortAnchor] = useState<{ top: number; right: number } | null>(null);
  const sortChipRef = useRef<any>(null);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [reportSheetOpen, setReportSheetOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; kind: 'success' | 'error' } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, kind: 'success' | 'error' = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, kind });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const loadGroup = useCallback(async () => {
    if (!id) return;
    try {
      const response = await groupService.getGroup(id);
      if (response.success && response.data) {
        setGroup(response.data);
      }
    } catch (error: any) {
      console.error('Error loading group:', error);
      Alert.alert('Error', 'Could not load group details. Please check your connection and try again.');
    }
  }, [id]);

  const loadPosts = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (!id) return;
    try {
      const response = await groupService.getGroupPosts(id, pageNum, 20, sortBy);
      if (response.success && response.data) {
        if (append) {
          setPosts((prev) => [...prev, ...response.data!]);
        } else {
          setPosts(response.data);
        }
        if (response.pagination) {
          setHasMore(pageNum < response.pagination.pages);
        }
      }
    } catch (error: any) {
      console.error('Error loading posts:', error);
      Alert.alert('Error', 'Could not load posts. Please check your connection and try again.');
    }
  }, [id, sortBy]);

  // Load group first (fast), then posts (can be slower)
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setIsLoading(true);
      if (id) {
        try {
          const groupResponse = await groupService.getGroup(id);
          if (mounted && groupResponse.success && groupResponse.data) {
            setGroup(groupResponse.data);
            setIsLoading(false);
          }
        } catch (error: any) {
          console.error('Error loading group:', error);
          if (mounted) {
            setIsLoading(false);
            Alert.alert('Error', 'Could not load group details. Please check your connection and try again.');
          }
        }
      }
      if (id) {
        loadPosts(1, false).catch((error) => {
          console.error('Error loading posts:', error);
        });
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [id, loadPosts]);

  // Refresh group data when screen comes into focus (e.g., returning from settings)
  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadGroup();
      }
    }, [id, loadGroup])
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setPage(1);
    setHasMore(true);
    await Promise.all([loadGroup(), loadPosts(1, false)]);
    setIsRefreshing(false);
  }, [loadGroup, loadPosts]);

  const handleJoinLeave = useCallback(async () => {
    if (!isAuthenticated || !group) {
      router.push('/(auth)/login');
      return;
    }

    setIsJoining(true);
    try {
      if (group.isMember) {
        const response = await groupService.leaveGroup(group._id);
        if (response.success) {
          setGroup({ ...group, isMember: false, memberCount: response.data!.memberCount });
          setJustJoined(false);
          showToast(`Left ${group.name}`);
        }
      } else {
        const response = await groupService.joinGroup(group._id);
        if (response.success) {
          setGroup({ ...group, isMember: true, memberCount: response.data!.memberCount });
          setJustJoined(true);
          showToast('You joined the group');
          setTimeout(() => setJustJoined(false), 2400);
        }
      }
    } catch (error) {
      console.error('Error joining/leaving group:', error);
      showToast('Something went wrong. Try again.', 'error');
    } finally {
      setIsJoining(false);
    }
  }, [group, isAuthenticated, router, showToast]);

  const openSortMenu = useCallback(() => {
    if (sortMenuOpen) {
      setSortMenuOpen(false);
      return;
    }
    const screenW = Dimensions.get('window').width;
    if (sortChipRef.current?.measureInWindow) {
      sortChipRef.current.measureInWindow((x: number, y: number, w: number, h: number) => {
        setSortAnchor({ top: y + h + 6, right: Math.max(12, screenW - (x + w)) });
        setSortMenuOpen(true);
      });
    } else {
      setSortAnchor(null);
      setSortMenuOpen(true);
    }
  }, [sortMenuOpen]);

  const onPickSort = useCallback((key: SortKey) => {
    setSortMenuOpen(false);
    if (key === sortBy) return;
    setSortBy(key);
    setPage(1);
    setHasMore(true);
    // loadPosts closes over sortBy; re-run on next tick with the new value.
    setTimeout(() => {
      groupService
        .getGroupPosts(id!, 1, 20, key)
        .then((res) => {
          if (res.success && res.data) {
            setPosts(res.data);
            if (res.pagination) setHasMore(1 < res.pagination.pages);
          }
        })
        .catch((e) => console.error('Error sorting posts:', e));
    }, 0);
  }, [id, sortBy]);

  const submitReport = useCallback(async (reason: string) => {
    if (!group) return;
    setReportSheetOpen(false);
    try {
      const response = await groupService.reportGroup(group._id, reason);
      if (response.success) {
        showToast('Report sent. Our team will review it.');
      } else {
        showToast(response.message || 'Failed to report group', 'error');
      }
    } catch (error) {
      console.error('Error reporting group:', error);
      showToast('Failed to report group', 'error');
    }
  }, [group, showToast]);

  const handleLikePost = async (postId: string) => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    try {
      const response = await postService.likePost(postId);
      if (response.success) {
        setPosts((prev) =>
          prev.map((post) => {
            if (post._id === postId) {
              const isLiked = post.likes.includes(user!._id);
              return {
                ...post,
                likes: isLiked
                  ? post.likes.filter((likeId) => likeId !== user!._id)
                  : [...post.likes, user!._id],
              };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleSharePost = async (post: Post) => {
    try {
      const authorName = post.author?.displayName || post.author?.username || 'Someone';
      await shareService.sharePost(post._id, post.content || '', authorName);
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage, true);
    }
  }, [isLoading, hasMore, page, loadPosts]);

  const getGradientColors = (coverImage: string): readonly [string, string] => {
    const optionId = coverImage.replace('gradient:', '');
    const gradients: { [key: string]: readonly [string, string] } = {
      blue: ['rgba(24, 119, 242, 0.8)', 'rgba(66, 103, 178, 0.8)'],
      purple: ['rgba(139, 92, 246, 0.8)', 'rgba(167, 139, 250, 0.8)'],
      teal: ['rgba(20, 184, 166, 0.8)', 'rgba(94, 234, 212, 0.8)'],
      pink: ['rgba(236, 72, 153, 0.8)', 'rgba(244, 114, 182, 0.8)'],
      orange: ['rgba(249, 115, 22, 0.8)', 'rgba(251, 146, 60, 0.8)'],
      green: ['rgba(34, 197, 94, 0.8)', 'rgba(74, 222, 128, 0.8)'],
    };
    return gradients[optionId] || ['rgba(96, 165, 250, 0.45)', 'rgba(167, 139, 250, 0.45)'];
  };

  const sortLabel = SORT_OPTIONS.find((o) => o.key === sortBy)?.label ?? 'Newest';

  // ---- Loading / error states ----
  if (isLoading && !group) {
    return (
      <LinearGradient colors={COLORS.backgroundGradient} style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="lg" />
        </View>
      </LinearGradient>
    );
  }

  if (!isLoading && !group && id) {
    return (
      <LinearGradient colors={COLORS.backgroundGradient} style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Could not load group</Text>
          <GlassButton title="Retry" onPress={() => { setIsLoading(true); loadGroup(); }} style={{ marginTop: SPACING.md }} />
        </View>
      </LinearGradient>
    );
  }

  if (!group) {
    return (
      <LinearGradient colors={COLORS.backgroundGradient} style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Group not found</Text>
          <GlassButton title="Back" onPress={() => router.back()} variant="primary" style={{ marginTop: SPACING.md }} />
        </View>
      </LinearGradient>
    );
  }

  const isMember = !!group.isMember;
  const isAdmin = !!group.isAdmin;

  // ---- Header (cover + top bar + header card) ----
  const renderHeader = () => (
    <>
      {/* COVER BANNER */}
      <View style={styles.coverSection}>
        {group.coverImage ? (
          group.coverImage.startsWith('gradient:') ? (
            <LinearGradient colors={getGradientColors(group.coverImage)} style={styles.coverFill} />
          ) : (
            <Image source={{ uri: group.coverImage }} style={styles.coverFill} />
          )
        ) : (
          <LinearGradient
            colors={['#1b2456', '#3a2c6b', '#582a6a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.coverFill}
          />
        )}
        {/* bottom fade into the page background */}
        <LinearGradient
          colors={['rgba(10,14,26,0)', 'rgba(10,14,26,0.75)']}
          style={StyleSheet.absoluteFill as any}
          pointerEvents="none"
        />
      </View>

      {/* FLOATING TOP BAR */}
      <View style={[styles.topBar, { top: insets.top + SPACING.xs }]}>
        <Pressable style={styles.circleBtn} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </Pressable>
        {isMember && (
          <View style={styles.topBarRight}>
            <Pressable style={styles.circleBtn} onPress={() => router.push(`/group/${group._id}/members`)} hitSlop={8}>
              <Ionicons name="people-outline" size={22} color={COLORS.white} />
            </Pressable>
            <Pressable style={styles.circleBtn} onPress={() => setOverflowOpen(true)} hitSlop={8}>
              <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.white} />
            </Pressable>
          </View>
        )}
      </View>

      {/* HEADER CARD */}
      <View style={styles.headerCard}>
        <View style={styles.avatarWrap}>
          {group.avatar ? (
            <Image source={{ uri: group.avatar }} style={styles.avatarImg} />
          ) : (
            <LinearGradient
              colors={['#60A5FA', '#A78BFA', '#7c3aed']}
              start={{ x: 0.3, y: 0.2 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <Ionicons name="people" size={38} color={COLORS.white} />
            </LinearGradient>
          )}
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.groupName}>{group.name}</Text>
          {group.isPrivate && (
            <View style={styles.badgeChip}>
              <Ionicons name="lock-closed" size={11} color={COLORS.textSecondary} />
              <Text style={styles.badgeChipText}>Private</Text>
            </View>
          )}
          {isAdmin && (
            <View style={styles.adminChip}>
              <Ionicons name="shield-checkmark" size={11} color={COLORS.primary} />
              <Text style={styles.adminChipText}>Admin</Text>
            </View>
          )}
        </View>

        <Text style={styles.metaLine}>
          {group.memberCount} members
          {group.country ? `  ·  ${getCountryName(group.country)}` : ''}
          {group.healthCondition ? `  ·  ${group.healthCondition}` : ''}
        </Text>

        {!!group.description && <Text style={styles.description}>{group.description}</Text>}

        {/* Join / Joined */}
        {!isMember && !justJoined && (
          <Pressable style={styles.joinBtn} onPress={handleJoinLeave} disabled={isJoining}>
            {isJoining ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Ionicons name="add" size={17} color={COLORS.white} />
                <Text style={styles.joinBtnText}>Join group</Text>
              </>
            )}
          </Pressable>
        )}
        {justJoined && (
          <View style={styles.joinedPill}>
            <Ionicons name="checkmark" size={16} color={COLORS.success} />
            <Text style={styles.joinedPillText}>Joined</Text>
          </View>
        )}
      </View>

      {/* POSTS HEADER */}
      <View style={styles.postsHeader}>
        <Text style={styles.postsTitle}>New posts</Text>
        {isMember && (
          <Pressable ref={sortChipRef} style={styles.sortChip} onPress={openSortMenu}>
            <Ionicons name="swap-vertical" size={15} color={COLORS.textSecondary} />
            <Text style={styles.sortChipText}>{sortLabel}</Text>
          </Pressable>
        )}
      </View>
    </>
  );

  return (
    <LinearGradient colors={COLORS.backgroundGradient} style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: SPACING.md }}>
            <PostCard
              post={item}
              onPress={() => {
                if (!isAuthenticated) { router.push('/(auth)/login'); return; }
                if (!requirePremium()) return;
                router.push(`/post/${item._id}`);
              }}
              onLike={() => handleLikePost(item._id)}
              onComment={() => {
                if (!isAuthenticated) { router.push('/(auth)/login'); return; }
                if (!requirePremium()) return;
                router.push(`/post/${item._id}`);
              }}
              onShare={() => handleSharePost(item)}
              currentUserId={user?._id}
            />
          </View>
        )}
        keyExtractor={(item) => item._id}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        onScrollBeginDrag={() => sortMenuOpen && setSortMenuOpen(false)}
        ListHeaderComponent={renderHeader()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={hasMore ? (
          <View style={styles.loadingFooter}><LoadingSpinner size="md" /></View>
        ) : null}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>
              {isMember ? 'Be the first to share something!' : 'Join to see posts'}
            </Text>
          </View>
        }
      />

      {/* FAB (members) */}
      {isMember && (
        <Pressable
          style={[styles.fab, { bottom: (insets.bottom || SPACING.md) + SPACING.sm }]}
          onPress={() => router.push(`/create-post?groupId=${group._id}`)}
        >
          <LinearGradient
            colors={['rgba(96, 165, 250, 0.95)', 'rgba(167, 139, 250, 0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color={COLORS.white} />
          </LinearGradient>
        </Pressable>
      )}

      {/* SORT MENU */}
      <Modal visible={sortMenuOpen} transparent animationType="fade" onRequestClose={() => setSortMenuOpen(false)}>
        <Pressable style={styles.menuOverlay} onPress={() => setSortMenuOpen(false)}>
          <View style={[styles.sortMenu, sortAnchor ? { top: sortAnchor.top, right: sortAnchor.right } : { top: 130, right: SPACING.md }]}>
            {SORT_OPTIONS.map((opt) => {
              const active = opt.key === sortBy;
              return (
                <Pressable key={opt.key} style={styles.sortRow} onPress={() => onPickSort(opt.key)}>
                  <Text style={[styles.sortRowText, active && styles.sortRowTextActive]}>{opt.label}</Text>
                  {active && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>

      {/* OVERFLOW SHEET */}
      <Modal visible={overflowOpen} transparent animationType="fade" onRequestClose={() => setOverflowOpen(false)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setOverflowOpen(false)}>
          <Pressable style={styles.sheetWrap} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetGroup}>
              {isAdmin && (
                <Pressable
                  style={[styles.sheetRow, styles.sheetRowDivider]}
                  onPress={() => { setOverflowOpen(false); router.push(`/group/${group._id}/settings`); }}
                >
                  <Text style={styles.sheetRowText}>Group Settings</Text>
                </Pressable>
              )}
              <Pressable
                style={[styles.sheetRow, !isAdmin && isMember ? styles.sheetRowDivider : null]}
                onPress={() => { setOverflowOpen(false); setLeaveConfirmOpen(true); }}
              >
                <Text style={styles.sheetRowDanger}>Leave Group</Text>
              </Pressable>
              {isMember && !isAdmin && (
                <Pressable style={styles.sheetRow} onPress={() => { setOverflowOpen(false); setReportSheetOpen(true); }}>
                  <Text style={styles.sheetRowDanger}>Report Group</Text>
                </Pressable>
              )}
            </View>
            <Pressable style={styles.sheetCancel} onPress={() => setOverflowOpen(false)}>
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* REPORT SHEET */}
      <Modal visible={reportSheetOpen} transparent animationType="fade" onRequestClose={() => setReportSheetOpen(false)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setReportSheetOpen(false)}>
          <Pressable style={styles.sheetWrap} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetGroup}>
              <Text style={styles.sheetHeading}>Why are you reporting this group?</Text>
              {REPORT_REASONS.map((r, i) => (
                <Pressable
                  key={r.key}
                  style={[styles.sheetRow, i < REPORT_REASONS.length - 1 ? styles.sheetRowDivider : null]}
                  onPress={() => submitReport(r.key)}
                >
                  <Text style={styles.sheetRowDanger}>{r.label}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.sheetCancel} onPress={() => setReportSheetOpen(false)}>
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* LEAVE CONFIRM */}
      <Modal visible={leaveConfirmOpen} transparent animationType="fade" onRequestClose={() => setLeaveConfirmOpen(false)}>
        <Pressable style={styles.dialogOverlay} onPress={() => setLeaveConfirmOpen(false)}>
          <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.dialogTitle}>Leave Group?</Text>
            <Text style={styles.dialogBody}>Are you sure you want to leave {group.name}?</Text>
            <View style={styles.dialogActions}>
              <Pressable style={styles.dialogCancel} onPress={() => setLeaveConfirmOpen(false)}>
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.dialogDanger}
                onPress={() => { setLeaveConfirmOpen(false); handleJoinLeave(); }}
              >
                <Text style={styles.dialogDangerText}>Leave</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* TOAST */}
      {toast && (
        <View
          style={[
            styles.toast,
            { bottom: (insets.bottom || SPACING.md) + SPACING.lg },
            toast.kind === 'error' ? styles.toastError : styles.toastSuccess,
          ]}
          pointerEvents="none"
        >
          <Text style={styles.toastText}>{toast.msg}</Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  errorText: { ...TYPOGRAPHY.h3, color: COLORS.error, marginTop: SPACING.md },
  listContent: { paddingBottom: 120, paddingTop: 0 },

  // Cover
  coverSection: { height: 150, width: '100%', position: 'relative', overflow: 'hidden' },
  coverFill: { width: '100%', height: '100%', resizeMode: 'cover' },

  // Top bar
  topBar: {
    position: 'absolute',
    left: SPACING.sm + 4,
    right: SPACING.sm + 4,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarRight: { flexDirection: 'row', gap: SPACING.sm },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.32)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header card
  headerCard: {
    marginTop: -26,
    marginHorizontal: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 22,
    zIndex: 6,
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: -46,
    borderWidth: 3,
    borderColor: COLORS.background,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: SPACING.xs, marginTop: 10 },
  groupName: { ...TYPOGRAPHY.h2, fontSize: 20, fontWeight: '800', color: COLORS.text, marginRight: SPACING.xs },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 22,
    paddingHorizontal: 9,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  badgeChipText: { ...TYPOGRAPHY.caption, fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },
  adminChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 22,
    paddingHorizontal: 9,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(96,165,250,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.35)',
  },
  adminChipText: { ...TYPOGRAPHY.caption, fontSize: 11, fontWeight: '700', color: COLORS.primaryLight },
  metaLine: { ...TYPOGRAPHY.caption, fontSize: 13, color: COLORS.textMuted, marginTop: 6 },
  description: { ...TYPOGRAPHY.body, fontSize: 14, lineHeight: 19, color: COLORS.textSecondary, marginTop: 12 },

  joinBtn: {
    marginTop: 14,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  joinBtnText: { ...TYPOGRAPHY.bodyMedium, fontSize: 15, fontWeight: '700', color: COLORS.white },
  joinedPill: {
    marginTop: 14,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(52,211,153,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  joinedPillText: { ...TYPOGRAPHY.bodyMedium, fontSize: 15, fontWeight: '700', color: COLORS.success },

  // Posts header
  postsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.md,
    marginTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
  },
  postsTitle: { ...TYPOGRAPHY.h3, fontSize: 18, fontWeight: '700', color: COLORS.text },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 30,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.glass.background,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  sortChipText: { ...TYPOGRAPHY.caption, fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  menuOverlay: { flex: 1, backgroundColor: 'transparent' },
  sortMenu: {
    position: 'absolute',
    minWidth: 160,
    padding: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(28,30,44,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 10,
  },
  sortRowText: { ...TYPOGRAPHY.body, fontSize: 15, color: COLORS.textSecondary },
  sortRowTextActive: { color: COLORS.text, fontWeight: '700' },

  loadingFooter: { padding: SPACING.md, alignItems: 'center' },
  emptyContainer: { padding: SPACING.xxl, alignItems: 'center' },
  emptyText: { ...TYPOGRAPHY.h3, color: COLORS.textSecondary, marginTop: SPACING.md },
  emptySubtext: { ...TYPOGRAPHY.body, color: COLORS.textMuted, marginTop: SPACING.xs, textAlign: 'center' },

  // FAB
  fab: {
    position: 'absolute',
    right: SPACING.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  fabGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Bottom sheets
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheetWrap: { paddingHorizontal: SPACING.sm + 4, paddingBottom: SPACING.lg },
  sheetGroup: {
    backgroundColor: 'rgba(30,32,48,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 18,
    overflow: 'hidden',
  },
  sheetHeading: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sheetRow: { paddingVertical: 16, alignItems: 'center' },
  sheetRowDivider: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  sheetRowText: { ...TYPOGRAPHY.body, fontSize: 16, fontWeight: '600', color: COLORS.text },
  sheetRowDanger: { ...TYPOGRAPHY.body, fontSize: 16, fontWeight: '600', color: COLORS.error },
  sheetCancel: {
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(30,32,48,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  sheetCancelText: { ...TYPOGRAPHY.body, fontSize: 16, fontWeight: '700', color: COLORS.text },

  // Dialog
  dialogOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  dialog: {
    width: '100%',
    backgroundColor: 'rgba(32,34,50,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
  },
  dialogTitle: { ...TYPOGRAPHY.h3, fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  dialogBody: { ...TYPOGRAPHY.body, fontSize: 14, lineHeight: 19, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 18 },
  dialogActions: { flexDirection: 'row', gap: SPACING.sm, alignSelf: 'stretch' },
  dialogCancel: {
    flex: 1,
    height: 42,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.glass.background,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogCancelText: { ...TYPOGRAPHY.bodyMedium, fontSize: 14, fontWeight: '700', color: COLORS.text },
  dialogDanger: {
    flex: 1,
    height: 42,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(248,113,113,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogDangerText: { ...TYPOGRAPHY.bodyMedium, fontSize: 14, fontWeight: '700', color: COLORS.error },

  // Toast
  toast: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    zIndex: 90,
  },
  toastSuccess: { backgroundColor: 'rgba(52,211,153,0.16)', borderColor: 'rgba(52,211,153,0.4)' },
  toastError: { backgroundColor: 'rgba(248,113,113,0.16)', borderColor: 'rgba(248,113,113,0.4)' },
  toastText: { ...TYPOGRAPHY.bodyMedium, fontSize: 14, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
});
