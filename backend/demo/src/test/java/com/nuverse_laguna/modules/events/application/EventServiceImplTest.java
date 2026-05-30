package com.nuverse_laguna.modules.events.application;

import com.nuverse_laguna.modules.events.domain.*;
import com.nuverse_laguna.modules.events.dto.*;
import com.nuverse_laguna.modules.events.repository.CampusEventRepository;
import com.nuverse_laguna.modules.events.repository.EventRsvpRepository;
import com.nuverse_laguna.shared.event.EventRsvpEvent;
import com.nuverse_laguna.shared.exception.AppException;
import com.nuverse_laguna.shared.exception.ResourceNotFoundException;
import com.nuverse_laguna.shared.storage.StorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EventServiceImpl")
class EventServiceImplTest {

    @Mock private CampusEventRepository eventRepository;
    @Mock private EventRsvpRepository rsvpRepository;
    @Mock private StorageService storageService;
    @Mock private ApplicationEventPublisher eventPublisher;

    private EventServiceImpl service;

    static final UUID CREATOR_ID  = UUID.randomUUID();
    static final UUID VIEWER_ID   = UUID.randomUUID();
    static final UUID EVENT_ID    = UUID.randomUUID();

    static final LocalDateTime FUTURE = LocalDateTime.now().plusDays(7);

    @BeforeEach
    void setUp() {
        service = new EventServiceImpl(eventRepository, rsvpRepository, storageService, eventPublisher);
    }

    // ─── createEvent ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("createEvent: persists event in DRAFT status")
    void createEvent_persistsDraftEvent() {
        when(eventRepository.save(any(CampusEvent.class))).thenAnswer(i -> i.getArgument(0));

        CreateEventRequest req = new CreateEventRequest(
                "NU Open Day", "Join us!", EventCategory.ACADEMIC,
                "NU Gym", FUTURE, null, null, 100);

        EventResponse resp = service.createEvent(CREATOR_ID, req);

        assertThat(resp.status()).isEqualTo("DRAFT");
        assertThat(resp.title()).isEqualTo("NU Open Day");
        verify(eventRepository).save(any(CampusEvent.class));
    }

    // ─── getEvent ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getEvent: returns event detail with rsvp flag")
    void getEvent_returnsDetail() {
        CampusEvent event = buildEvent();
        when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(event));
        when(rsvpRepository.countByEventIdAndStatus(eq(EVENT_ID), eq(RsvpStatus.ATTENDING))).thenReturn(5L);
        when(rsvpRepository.existsByEventIdAndUserIdAndStatus(eq(EVENT_ID), eq(VIEWER_ID), eq(RsvpStatus.ATTENDING))).thenReturn(true);

        EventResponse resp = service.getEvent(EVENT_ID, VIEWER_ID);

        assertThat(resp.rsvpCount()).isEqualTo(5L);
        assertThat(resp.isRsvpd()).isTrue();
    }

    @Test
    @DisplayName("getEvent: not found throws ResourceNotFoundException")
    void getEvent_notFound_throws() {
        when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getEvent(EVENT_ID, VIEWER_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ─── updateEvent ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("updateEvent: non-creator gets 403 Forbidden")
    void updateEvent_nonCreator_throwsForbidden() {
        CampusEvent event = buildEvent(); // created by CREATOR_ID
        when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(event));
        UUID other = UUID.randomUUID();

        UpdateEventRequest req = new UpdateEventRequest(
                "Changed", null, EventCategory.CULTURAL, "Auditorium",
                FUTURE, null, null, null);

        assertThatThrownBy(() -> service.updateEvent(other, EVENT_ID, req))
                .isInstanceOf(AppException.class)
                .satisfies(e -> assertThat(((AppException) e).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    // ─── publishEvent ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("publishEvent: DRAFT → PUBLISHED")
    void publishEvent_drafBecomesPublished() {
        CampusEvent event = buildEvent();
        when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(event));
        when(rsvpRepository.countByEventIdAndStatus(eq(EVENT_ID), any())).thenReturn(0L);

        EventResponse resp = service.publishEvent(CREATOR_ID, EVENT_ID);

        assertThat(resp.status()).isEqualTo("PUBLISHED");
    }

    @Test
    @DisplayName("publishEvent: already PUBLISHED throws 409")
    void publishEvent_alreadyPublished_throws() {
        CampusEvent event = buildEvent();
        event.publish(); // move to PUBLISHED first
        when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> service.publishEvent(CREATOR_ID, EVENT_ID))
                .isInstanceOf(AppException.class)
                .satisfies(e -> assertThat(((AppException) e).getStatus()).isEqualTo(HttpStatus.CONFLICT));
    }

    // ─── cancelEvent ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("cancelEvent: PUBLISHED → CANCELLED")
    void cancelEvent_publishedBecomeCancelled() {
        CampusEvent event = buildEvent();
        event.publish();
        when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(event));
        when(rsvpRepository.countByEventIdAndStatus(eq(EVENT_ID), any())).thenReturn(0L);

        EventResponse resp = service.cancelEvent(CREATOR_ID, EVENT_ID);

        assertThat(resp.status()).isEqualTo("CANCELLED");
    }

    // ─── deleteEvent ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("deleteEvent: removes DRAFT event")
    void deleteEvent_draftDeletedSuccessfully() {
        CampusEvent event = buildEvent(); // DRAFT
        when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(event));

        service.deleteEvent(CREATOR_ID, EVENT_ID);

        verify(eventRepository).delete(event);
    }

    @Test
    @DisplayName("deleteEvent: published event throws 409")
    void deleteEvent_published_throws409() {
        CampusEvent event = buildEvent();
        event.publish();
        when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> service.deleteEvent(CREATOR_ID, EVENT_ID))
                .isInstanceOf(AppException.class)
                .satisfies(e -> assertThat(((AppException) e).getStatus()).isEqualTo(HttpStatus.CONFLICT));
    }

    // ─── rsvp ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("rsvp: creates RSVP for published upcoming event and publishes event")
    void rsvp_succeeds_publishesEvent() {
        CampusEvent event = buildEvent();
        event.publish();
        when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(event));
        when(rsvpRepository.existsByEventIdAndUserIdAndStatus(eq(EVENT_ID), eq(VIEWER_ID), eq(RsvpStatus.ATTENDING))).thenReturn(false);
        when(rsvpRepository.countByEventIdAndStatus(eq(EVENT_ID), eq(RsvpStatus.ATTENDING))).thenReturn(3L);
        when(rsvpRepository.findByEventIdAndUserId(EVENT_ID, VIEWER_ID)).thenReturn(Optional.empty());
        when(rsvpRepository.save(any(EventRsvp.class))).thenAnswer(i -> i.getArgument(0));

        service.rsvp(VIEWER_ID, EVENT_ID);

        verify(rsvpRepository).save(any(EventRsvp.class));
        ArgumentCaptor<EventRsvpEvent> captor = ArgumentCaptor.forClass(EventRsvpEvent.class);
        verify(eventPublisher).publishEvent(captor.capture());
        assertThat(captor.getValue().getUserId()).isEqualTo(VIEWER_ID);
        assertThat(captor.getValue().getEventId()).isEqualTo(EVENT_ID);
    }

    @Test
    @DisplayName("rsvp: duplicate RSVP throws DuplicateRsvpException (409)")
    void rsvp_duplicate_throws409() {
        CampusEvent event = buildEvent();
        event.publish();
        when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(event));
        when(rsvpRepository.existsByEventIdAndUserIdAndStatus(eq(EVENT_ID), eq(VIEWER_ID), eq(RsvpStatus.ATTENDING))).thenReturn(true);

        assertThatThrownBy(() -> service.rsvp(VIEWER_ID, EVENT_ID))
                .isInstanceOf(DuplicateRsvpException.class)
                .satisfies(e -> assertThat(((AppException) e).getStatus()).isEqualTo(HttpStatus.CONFLICT));
    }

    @Test
    @DisplayName("rsvp: RSVP on DRAFT event throws 409")
    void rsvp_draftEvent_throws409() {
        CampusEvent event = buildEvent(); // DRAFT — rsvpOpen() == false
        when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> service.rsvp(VIEWER_ID, EVENT_ID))
                .isInstanceOf(AppException.class)
                .satisfies(e -> assertThat(((AppException) e).getStatus()).isEqualTo(HttpStatus.CONFLICT));
    }

    @Test
    @DisplayName("rsvp: capacity exceeded throws EventCapacityExceededException (409)")
    void rsvp_capacityExceeded_throws409() {
        CampusEvent event = buildEvent();
        event.publish();
        when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(event)); // capacity = 100
        when(rsvpRepository.existsByEventIdAndUserIdAndStatus(eq(EVENT_ID), eq(VIEWER_ID), eq(RsvpStatus.ATTENDING))).thenReturn(false);
        when(rsvpRepository.countByEventIdAndStatus(eq(EVENT_ID), eq(RsvpStatus.ATTENDING))).thenReturn(100L); // full

        assertThatThrownBy(() -> service.rsvp(VIEWER_ID, EVENT_ID))
                .isInstanceOf(EventCapacityExceededException.class);
    }

    // ─── cancelRsvp ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("cancelRsvp: cancels an active RSVP")
    void cancelRsvp_cancelsSuccessfully() {
        EventRsvp rsvp = EventRsvp.create(EVENT_ID, VIEWER_ID);
        when(rsvpRepository.findByEventIdAndUserId(EVENT_ID, VIEWER_ID)).thenReturn(Optional.of(rsvp));

        service.cancelRsvp(VIEWER_ID, EVENT_ID);

        assertThat(rsvp.getStatus()).isEqualTo(RsvpStatus.CANCELLED);
    }

    @Test
    @DisplayName("cancelRsvp: no RSVP throws ResourceNotFoundException")
    void cancelRsvp_noRsvp_throws() {
        when(rsvpRepository.findByEventIdAndUserId(EVENT_ID, VIEWER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.cancelRsvp(VIEWER_ID, EVENT_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ─── getMyRsvps ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("getMyRsvps: returns paginated RSVP list")
    void getMyRsvps_returnsMappedPage() {
        EventRsvp rsvp = EventRsvp.create(EVENT_ID, VIEWER_ID);
        CampusEvent event = buildEvent();
        Page<EventRsvp> rsvpPage = new PageImpl<>(List.of(rsvp), PageRequest.of(0, 12), 1);
        when(rsvpRepository.findByUserIdAndStatus(eq(VIEWER_ID), eq(RsvpStatus.ATTENDING), any())).thenReturn(rsvpPage);
        when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(event));

        Page<RsvpResponse> result = service.getMyRsvps(VIEWER_ID, PageRequest.of(0, 12));

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).eventTitle()).isEqualTo("NU Open Day");
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private CampusEvent buildEvent() {
        return CampusEvent.create(CREATOR_ID, "NU Open Day", "Join us!",
                EventCategory.ACADEMIC, "NU Gym", FUTURE, null, null, 100);
    }
}
