package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/google/gopacket"
	"github.com/google/gopacket/layers"
	"github.com/google/gopacket/pcap"
)

func main() {
	devices, err := pcap.FindAllDevs()
	if err != nil {
		log.Fatal(err)
	}

	device := devices[4].Name // ✅ your working Wi-Fi adapter

	handle, err := pcap.OpenLive(device, 1600, true, pcap.BlockForever)
	if err != nil {
		log.Fatal(err)
	}
	defer handle.Close()

	fmt.Println("Listening on:", device)

	packetSource := gopacket.NewPacketSource(handle, handle.LinkType())

	for packet := range packetSource.Packets() {

		var srcIP, dstIP, domain string

		if ipLayer := packet.Layer(layers.LayerTypeIPv4); ipLayer != nil {
			ip := ipLayer.(*layers.IPv4)
			srcIP = ip.SrcIP.String()
			dstIP = ip.DstIP.String()
		}

		if dnsLayer := packet.Layer(layers.LayerTypeDNS); dnsLayer != nil {
			dns := dnsLayer.(*layers.DNS)
			if len(dns.Questions) > 0 {
				domain = string(dns.Questions[0].Name)
			}
		}

		if srcIP != "" && dstIP != "" {
			event := map[string]string{
				"src_ip": srcIP,
				"dst_ip": dstIP,
				"domain": domain,
			}

			jsonData, _ := json.Marshal(event)
			fmt.Println(string(jsonData))
		}
	}
}
