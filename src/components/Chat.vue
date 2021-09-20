<template>
  <div class="chat container">
    <div class="row">
      <div class="col-7">
        <div class="row" v-for="message in messages" :key="messages.indexOf(message)">
          <div class="alert" v-bind:class="[ message[0] == 'Bot' ? 'alert-secondary' : 'alert-primary' ]">
            {{ message[1] }}
          </div>
        </div>
        <input v-model="text" @keydown="keyDown" class="form-control" placeholder="Type message then press enter..." />
      </div>
      <div class="col-1">
      </div>
      <div class="col-4">
        <div class="row" v-for="booking in bookings" :key="bookings.indexOf(booking)">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">{{ booking.title }}</h5>
              <p class="card-text">
                <strong>Location</strong> {{ booking.room }}<br />
                <strong>Start</strong> {{ booking.startDateTime.toLocaleString() }}<br />
                <strong>End</strong> {{ booking.endDateTime.toLocaleString() }}<br />
                <strong>Attendees</strong> {{ booking.attendees.join(', ')  }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import axios from "axios";
import { QueryResponse } from "../query-response";
import { Speaker } from "../speaker";
import { Booking } from "../booking";
import DateTimeParser from "../datetime-parser";

@Component
export default class Chat extends Vue {
  text = "";
  messages : [Speaker, string][] = [
    [ "Bot", "How can I help you?" ]
  ];
  bookings: Booking[] = [];

  keyDown(event: KeyboardEvent) {
    if(event.key != "Enter") {
      return;
    }

    this.messages.push([ "User", this.text ]);

    let url = 
      "{URLHERE}";

    const query = encodeURIComponent(this.text);

    url += query;

    this.text = "";

    axios.get<QueryResponse>(url).then(response => {
      this.interpretResponse(response.data);
    });
  }

  private interpretResponse(data: QueryResponse) {
    const intent = data.prediction.topIntent;
    
    if(intent === "None") {
      this.messages.push([ "Bot", "I'm sorry - I didn't understand that?"]);
      return;
    }

    const potentialBooking = this.extractPotentialBook(data);
    const isAvailable = this.checkAvailability(potentialBooking);

    if(!isAvailable) {
      this.messages.push([ "Bot", "The requested room is not available"]);
      return;
    }

    switch(intent) {
      case "CheckAvailability":
        this.messages.push([ "Bot", "Yes the room is available please request to book."]);
        break;
      case "BookRoom":        
        this.bookings.push(potentialBooking);
        this.messages.push([ "Bot", `"${potentialBooking.title}" booked in ${potentialBooking.room}`]);
        break;
    }
  }

  private checkAvailability(potentialBooking: Booking) {
    const hasOverlap = this.bookings.length > 0 && this.bookings.some(existingBooking => {
      return existingBooking.room === potentialBooking.room
        && existingBooking.startDateTime < potentialBooking.endDateTime 
        && potentialBooking.startDateTime < existingBooking.endDateTime;
    });

    return !hasOverlap;
  }

  private extractPotentialBook(data: QueryResponse) : Booking {
    // Default bookings to "Pod 1"
    const room = data.prediction.entities.Room?.[0]?.[0] as string || "Pod 1";

    //Default title to "Unkown Meeting" if not specified
    const title = data.prediction.entities?.BookingTitle?.[0] as string || "Unkown Meeting";

    const attendees = data.prediction.entities?.personName as string[] || [];

    const dateTimeParser = new DateTimeParser(data.prediction.entities.datetimeV2);
    
    return {
      room,
      title,
      attendees,
      startDateTime: dateTimeParser.start,
      endDateTime: dateTimeParser.end
    };
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
div.card {
  margin-bottom: 1em;
}
</style>
